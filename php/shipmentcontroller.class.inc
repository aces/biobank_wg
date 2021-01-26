<?php declare(strict_types=1);
/**
 * This class features the code that enables access to the Shipments of the LORIS
 * Biobank Module.
 *
 * PHP Version 7.2
 *
 * @category   Controller
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Lors/
 */
namespace LORIS\biobank;

/**
 * This class features the code that enables access to the Shipments of the LORIS
 * Biobank Module.
 *
 * PHP Version 7.2
 *
 * @category   Controller
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Lors/
 */
class ShipmentController
{
    /**
     * Private instances of the Database, User and ContainerDAO classes
     *
     * @var \Database   $db
     * @var \User       $user
     * @var ShipmentDAO $dao
     */
    private $db;
    private $user;
    private $dao;

    /**
     * Shipment Controller Class constructor
     *
     * @param Database $db   Database Instance.
     * @param User     $user User Instance.
     */
    function __construct(\Database $db, \User $user)
    {
        $this->db   = $db;
        $this->user = $user;
        $this->dao  = $this->getDataProvisioner();
    }

    /**
     * Get all Shipment Objects permitted by the Shipment Data Provisioner (DAO).
     *
     * @return array
     */
    public function getInstances() : array
    {
        $this->validatePermission('view');
        $shipments  = array();
        $shipmentIt = $this->dao->execute($this->user);
        foreach ($shipmentIt as $id => $shipment) {
            $shipments[$id] = $shipment;
        }

        return $shipments;
    }

    /**
     * This method takes in a list of shipment and container arrays from the
     * front-end. The shipments are validated while the containers are
     * sent to their respective controller to be validated and saved. The ids of
     * the saved containers are set to the shipment instances which are then
     * sent to the DAO to be saved.
     *
     * @param array $list a list of shipment and container arrays to be created.
     *
     * @return array $shipment a list of shipment objects that were created.
     */
    public function createInstances(array $list) : array
    {
        $this->validatePermision('create');
        $shipments = array();
        foreach ($list as $i => $shipmentArray) {
            $shipment = (new Shipment())->fromArray($shipmentArray);
            $this->validateInstance($shipment);
            $shipments[] = $this->dao->saveInstance($shipment);
        }

        return $shipments;
    }

    /**
     * This method takes in a shipment array from the front-end, validates it,
     * instantiates it and then sends it to the DAO to be saved to the
     * database.
     *
     * @param array $shipmentArray shipment array to be created
     *
     * @return \Shipment updated Shipment
     */
    public function updateInstance(array $shipmentArray) : Shipment
    {
        $this->validatePermission('update');
        $shipment = (new Shipment())->fromArray($shipmentArray);
        $this->validateInstance($shipment);
        return $this->dao->saveInstance($shipment);
    }

    public function getOptions() : array
    {
        return ['statuses' => $this->dao->getStatuses()];
    }

    /**
     * Treats the Shipment DAO as a Provisioner that can be iteratated
     * through to provide the permissable Shipment Objects for the current User.
     *
     * @return \LORIS\Data\Provisioner
     */
    private function getDataProvisioner() : \LORIS\Data\Provisioner
    {
        $dao = new ShipmentDAO($this->db);

        if ($this->user->hasPermission('access_all_profiles') === false) {
            $dao = $dao->filter(new \LORIS\Data\Filters\UserSiteMatch());
        }
        return $dao;
    }

    /**
     * Checks User Permissions for creating or updating Shipment Objects.
     *
     * @param string $method User requested action
     *
     * @return void
     */
    private function validatePermission(string $method) : void
    {
        // switch($method) {
        // case 'view':
        //     if (!$this->user->hasPermission('biobank_shipment_view')) {
        //         throw new \Forbidden('Shipment: View Permission Denied');
        //     }
        //     break;
        // case 'update':
        //     if (!$this->user->hasPermission('biobank_shipment_update')) {
        //         throw new \Forbidden('Shipment: Update Permission Denied');
        //     }
        //     break;
        // case 'create':
        //     if (!$this->user->hasPermission('biobank_shipment_create')) {
        //         throw new \Forbidden('Shipment: Create Permission Denied');
        //     }
        //     break;
        // }
    }

    /**
     * Validates Shipment Data before being saved
     *
     * @param Shipment $shipment Shipment to be validated.
     *
     * @return void
     */
    private function validateInstance(Shipment $shipment) : void
    {
        $this->validateBarcode($shipment);
        $this->validateOriginCenter($shipment);
        $this->validateDestinationCenter($shipment);
        // $this->validateLogs($shipment);
    }

    /**
     * Validates Shipment Object Barcode.
     *
     * @param Shipment $shipment Shipment to be validated.
     *
     * @throws BadRequest if the provided Shipment does not meet validation requirements.
     *
     * @return void
     */
    private function validateBarcode(Shipment $shipment) : void
    {
        if (is_null($shipment->getBarcode())) {
            throw new \BadRequest("Shipment Barcode value must be set");
        }
    }

    /**
     * Validates Shipment Object Origin Center.
     *
     * @param Shipment|Process $object Object to be validated.
     *
     * @throws BadRequest if the provided object does not meet validation requirements.
     *
     * @return void
     */
    private function validateOriginCenter(Shipment $shipment) : void
    {
    }

    /**
     * Validates Shipment Object Destination Center.
     *
     * @param Shipment|Process $object Object to be validated.
     *
     * @throws BadRequest if the provided object does not meet validation requirements.
     *
     * @return void
     */
    private function validateDestinationCenter(Shipment $shipment) : void
    {
    }

    // /**
    //  * Validates Shipment Object Logs.
    //  *
    //  * @param Shipment $shipment Shipment to be validated.
    //  *
    //  * @throws BadRequest if the provided Shipment does not meet validation requirements.
    //  *
    //  * @return void
    //  */
    // private function validateLogs(Shipment $shipment) : void
    // {
    //     $logs = $shipment->getLogs();
    //     foreach ($log as $log) {
    //         $this->validateCenter($log);
    //         $this->validateStatus($log);
    //         $this->validateUser($log);
    //         $this->validateTemperature($log);
    //         $this->validateDate($log);
    //         $this->validateTime($log);
    //     }
    // }

    // /**
    //  * Validates Shipment Log Center.
    //  *
    //  * @param Process $Log Log to be validated.
    //  *
    //  * @throws BadRequest if the provided Log does not meet validation requirements.
    //  *
    //  * @return void
    //  */
    // private function validateCenter(Log $log) : void
    // {
    // }

    // /**
    //  * Validates Shipment Log Status.
    //  *
    //  * @param Process $log Log to be validated.
    //  *
    //  * @throws BadRequest if the provided Log does not meet validation requirements.
    //  *
    //  * @return void
    //  */
    // private function validateStatus(Log $log) : void
    // {
    // }

    // /**
    //  * Validates Shipment Log User.
    //  *
    //  * @param Process $log Log to be validated.
    //  *
    //  * @throws BadRequest if the provided Log does not meet validation requirements.
    //  *
    //  * @return void
    //  */
    // private function validateUser(Log $log) : void
    // {
    // }

    // /**
    //  * Validates Shipment Log Temperature.
    //  *
    //  * @param Process $log Log to be validated.
    //  *
    //  * @throws BadRequest if the provided Log does not meet validation requirements.
    //  *
    //  * @return void
    //  */
    // private function validateTemperature(Log $log) : void
    // {
    // }

    // // XXX: Now that the DateTime object is used to store date and time,
    // // I don't know if these checks are as important because the DateTime
    // // doesn't have a native format. As long as it can be converted to 
    // // datetime properly, then there isn't really need for validation here.
    // // TODO: 
    // /**
    //  * Validates Shipment Log Date.
    //  *
    //  * @param Process $process Process to be validated.
    //  *
    //  * @throws BadRequest if the provided Process does not meet validation requirements.
    //  *
    //  * @return void
    //  */
    // private function validateDate(Log $log) : void
    // {
    //     // TODO: query date format from backend configuration.
    //     //  $format = 'd-m-Y';
    //     //  $date   = \DateTime::createFromFormat($format, $pool->getDate());
    //     //  if ($date && $date->format($format) !== $pool->getDate()) {
    //     //      throw new \BadRequest("Processing date must be of the format: $format");
    //     //  }
    // }

    // /**
    //  * Validates Shipment Log Time.
    //  *
    //  * @param Process $process Process to be validated.
    //  *
    //  * @throws BadRequest if the provided Process does not meet validation requirements.
    //  *
    //  * @return void
    //  */
    // private function validateTime(Log $log) : void
    // {
    //     // TODO: query time format from backend configuration.
    //     // $format = 'H:i';
    //     // $time   = \DateTime::createFromFormat($format, $pool->getTime());
    //     // if ($time && $time->format($format) !== $pool->getTime()) {
    //     //     throw new \BadRequest("Processing time must be of the format: $format");
    //     // }
    // }
}
