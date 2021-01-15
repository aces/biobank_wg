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
        // TODO: Not sure if this should default be queried....
        $this->centers = \Utility::getSiteList();
    }

    // XXX: I'm not sure if this function is really necessary since it is only
    // being used once, and should likely not be accessed outside this class.
    /**
     * This method is used when the DAO class needs to create a new Shipment
     * instance.
     *
     * @return Shipment
     */
    private function getInstance() : Shipment
    {
        return new Shipment();
    }

    /**
     * This will load all shipment persistence variables from the database for a
     * given $id into a Shipment object, and return the object.
     *
     * @param int $id Value of the $id for the Shipment that will be
     *                instantiated
     *
     * @return Shipment $shipment Shipment Instance.
     */
    public function getInstanceFromId(int $id) : Shipment
    {
        return $this->selectInstances([['column'=>'ShipmentID', 'value'=>$id]])[$id];
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
        $query = "SELECT s.ShipmentID,
                         s.TrackingNumber,
                         s.OriginCenterID,
                         s.DestinationCenterID
                  FROM shipment s";
        if (!empty($conditions)) {
            $whereClause = [];
            foreach($conditions as $condition) {
                $whereClause[] = $condition['column'].'='.'"'.$condition['value'].'"';
            }
            $query .= ' WHERE '.implode(" $operator ", $whereClause);
        }
        $query .= " GROUP BY s.ShipmentID";

        $shipmentRows = $this->db->pselectWithIndexKey($query, [], 'TrackingNumber');

        $shipments = array();
        if (!empty($shipmentRows)) {
            foreach ($shipmentRows as $id => $shipmentRow) {
                $shipment       = $this->getInstanceFromSQL($shipmentRow);
                $shipments[$id] = $shipment;
            }
        }

        return $shipments;
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
        // Converts Shipment Object into SQL format.
        $shipmentSQL = $this->getSQLFromInstance($shipment);

        // Inserts or Updates the shipment with respective data.
        $this->db->insertOnDuplicateUpdate(
            'shipment',
            $shipmentSQL
        );

        return $this->getInstanceFromId($shipment->getId());
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
        // TODO: move to own function
        $centers = array_flip($this->centers);
        $originCenterId = $centers[$shipment->getOriginCenter()];
        $destinationCenterId = $centers[$shipment->getDestinationCenter()];

        return array(
                     'ShipmentID'          => $shipment->getId(),
                     'TrackingNumber'      => $shipment->getTrackingNmber(),
                     'OriginCenterID'      => $originCenterId,
                     'DestinationCenterID' => $destinationCenterId,
                    );
    }

    /**
     * This function takes an array that resulted from an SQL query and
     * instantiates it as a Shipment Object.
     *
     * @param array $data       Values to be converted to array.
     *
     * @return Shipment 
     */
    private function getInstanceFromSQL(array $data) : Shipment
    {
        // TODO: move to own function
        print_r($this->centers);
        $originCenter = (int) $this->centers[$data['OriginCenterID']];
        $destinationCenter = (int) $this->center[$data['DestinationCenterID']];

        $shipment = $this->getInstance();
        $shipment->setId((int) $data['ShipmentID']);
        $shipment->setTrackingNumber((string) $data['TrackingNumber']);
        $shipment->setOriginCenter((string) $originCenter);
        $shipment->setDestinationCenter((string) $destinationCenter);

        return $shipment;
    }
}
