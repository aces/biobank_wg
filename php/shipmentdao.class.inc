<?php declare(strict_types=1);
/**
 * Shipment Data Access Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Shipment Object instances
 *
 * PHP Version 7.2
 *
 * @category   DAO
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
namespace LORIS\biobank;

/**
 * Shipment Data Access Object (DAO) Class
 * This class contains all database handling that is needed to
 * permanently store and retrieve Shipment Object instances
 *
 * PHP Version 7.2
 *
 * @category   DAO
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
class ShipmentDAO extends \LORIS\Data\ProvisionerInstance
{
    /**
     * Private instance of the Database class.
     *
     * @var \Database $dao
     */
    private $db;

    /**
     * Initializes a new instance of the ShipmentDAO Class
     *
     * @param Database $db Instance of the LORIS Database class
     */
    function __construct(\Database $db)
    {
        $this->db = $db;
    }

    /**
     * This method is used when the DAO class needs to create a new Shipment
     * instance.
     *
     * @return Shipment
     */
    private function getInstance($shipmentArray) : Shipment
    {
        return new Shipment($shipmentArray);
    }

    /**
     * This will load all shipment persistence variables from the database for a
     * given $id into a Shipment object, and return the object.
     *
     * @param string $barcode Value of the $barocde for the Shipment that will be
     *                        instantiated
     *
     * @return Shipment $shipment Shipment Instance.
     */
    public function getInstanceFromBarcode(string $barcode) : Shipment
    {
        return $this->selectInstances([['column'=>'s.Barcode', 'value'=>$barcode]])[$barcode];
    }

    /**
     * This will select all shipments from the database that match the
     * attribute values passed by $conditions and will return an array
     * of shipment objects.
     *
     * @param array $conditions Conditions to be met by the query
     *
     * @return array $shipments List of Shipment Objects that match the query
     */
    public function selectInstances(?array $conditions = [], $operator = 'AND') : array
    {
        $query = "SELECT s.ShipmentID as id,
                         s.Barcode as barcode,
                         s.DestinationCenterID as destinationCenterId,
                         GROUP_CONCAT(bc.ContainerId) as containerIds
                  FROM shipment s
                  LEFT JOIN psc psc
                    ON (s.DestinationCenterID=psc.CenterID)
                  LEFT JOIN biobank_container_shipment_rel bcsr
                    ON (s.ShipmentID=bcsr.ShipmentID)
                  LEFT JOIN biobank_container bc
                    ON (bcsr.ContainerID=bc.ContainerID)";
        if (!empty($conditions)) {
            $whereClause = [];
            foreach($conditions as $condition) {
                $whereClause[] = $condition['column'].'='.'"'.$condition['value'].'"';
            }
            $query .= ' WHERE '.implode(" $operator ", $whereClause);
        }
        $query .= " GROUP BY s.ShipmentID";

        $shipments = [];
        $shipmentRows = $this->db->pselectWithIndexKey($query, [], 'barcode');
        $logs = $this->getLogs();
        foreach ($shipmentRows as $barcode => $shipmentRow) {
            $shipmentRow['containerIds'] = $shipmentRow['containerIds'] ?
              explode(',', $shipmentRow['containerIds']) : [];
            $shipmentRow['logs'] = $logs[$barcode];
            $shipment = new Shipment($shipmentRow);
            $shipments[$barcode] = $shipment;
        }

        return $shipments;
    }

    public function getLogs() : array
    {
        $query = "SELECT s.Barcode as barcode,
                         sl.CenterID as centerId,
                         u.Real_name as user,
                         ss.Label as status,
                         sl.Temperature as temperature,
                         sl.Date as date,
                         sl.Time as time
                  FROM shipment_log sl
                  LEFT JOIN shipment s
                    ON (sl.ShipmentID=s.ShipmentID)
                  LEFT JOIN psc
                    ON (sl.CenterID=psc.CenterID)
                  LEFT JOIN users u
                    ON (sl.UserID=u.UserID)
                  LEFT JOIN shipment_status ss
                    ON (sl.StatusID=ss.StatusID)
                  ORDER BY date, time";
        $logRows = $this->db->pselectWithIndexKey($query, [], 'barcode');

        $logs = [];
        foreach ($logRows as $barcode => $logRow) {
            $logs[$barcode][] = $logRow;
        }
        return $logs;
    }

    /**
     * Instantiates an ArrayIterator class that is composed of all the Shipment
     * Objects.
     *
     * @return traversable Iterator of Shipment Objects
     */
    protected function getAllInstances() : \Traversable
    {
        return new \ArrayIterator($this->selectInstances());
    }

    public function getStatuses() : array
    {
        $query = "SELECT Label as label, Label FROM shipment_status";
        return $this->db->pselectColWithIndexKey($query, [], 'label');
    }

    /**
     * This function receives a Shipment Object, converts it into a SQL format
     * and inserts it into all relevant tables in the database.
     *
     * @param Shipment $shipment The Shipment Object to be saved the
     *                           database.
     *
     * @return Shipment $shipment The Shipment Object that was saved
                                  to the database.
     */
    public function saveInstance(Shipment $shipment) : Shipment
    {
        //TODO: This should probably have a try catch block of sorts.
        // Converts Shipment Object into SQL format and inserts into database.
        $shipmentSQL = $this->getSQLFromInstance($shipment);
        $this->db->insertOnDuplicateUpdate(
            'shipment',
            $shipmentSQL
        );

        $shipmentId = $shipment->id ?? $this->db->getLastInsertID();

        foreach($shipment->logs as $log) {
            $logSQL = $this->getLogSQLFromInstance($log, $shipmentId);
            $this->db->insertOnDuplicateUpdate(
                'shipment_log',
                $logSQL
            );
        }

        $containerIds = $this->getAllContainerIds($shipment);
        foreach($containerIds as $containerId) {
            $this->db->insertOnDuplicateUpdate(
                'biobank_container_shipment_rel',
                ['ShipmentID' => $shipmentId, 'ContainerID' => $containerId]
            );
        }

        return $this->getInstanceFromBarcode($shipment->barcode);
    }

    private function getAllContainerIds(Shipment $shipment) : array
    {
        $containerDAO = new ContainerDAO($this->db);
        $childContainerIds = [];
        foreach($shipment->containerIds as $containerId) {
            $container = $containerDAO->getInstanceFromId((int) $containerId);
            $childContainerIds = array_merge(
                $childContainerIds,
                $containerDAO->getAllChildContainerIds($container)
            );
        }
        $allContainerIds = array_merge(
            $childContainerIds,
            $shipment->containerIds
        );
        return array_unique($allContainerIds);
    }

    /**
     * This function takes a Shipment Instance and prepares the data to be
     * inserted into the database by converting it to a data array. This one to
     * one mapping is done to enable the update or insertion of data into the
     * database directly from the resulting arrays.
     *
     * @param Shipment $shipment Shipment Instance to be converted
     *
     * @return array $data Array containing the data to be inserted
     */
    private function getSQLFromInstance(Shipment $shipment) : array
    {
        return [
                'ShipmentID'          => $shipment->id,
                'Barcode'             => $shipment->barcode,
                'DestinationCenterID' => $shipment->destinationCenterId,
               ];
    }

    private function getLogSQLFromInstance(Log $log, string $shipmentId) : array
    {
        // TODO: These queries feel clumsy. There is likely a better way to get
        // the ID.
        $statusId = $this->db->pselectOne(
            'SELECT StatusID from shipment_status WHERE Label=:l', ['l' => $log->status]
        );
        $userId = $this->db->pselectOne(
            'SELECT ID FROM users WHERE UserID=:u', ['u' => $log->user]
        );

        return [
                'ShipmentID'  => $shipmentId,
                'CenterID'    => $log->centerId,
                'StatusID'    => $statusId,
                'Temperature' => $log->temperature,
                'Date'        => (new \DateTime($log->date))->format('Y-m-d H:i'),
                'Time'        => (new \DateTime($log->time))->format('Y-m-d H:i'),
                'UserID'      => $userId,
               ];
    }
}