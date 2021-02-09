<?php declare(strict_types=1);
/**
 * This class features the code that enables access to the Shipments of the LORIS
 * Biobank Module.
 *
 * PHP Version 7.2
 *
 * @category   Handler
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
 * @category   Handler
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Lors/
 */
class ShipmentHandler
{
    /**
     * Private instances of the Database, User and ContainerDAO classes
     *
     * @var \Shipment   $shipment
     * @var \Database   $db
     * @var \User       $user
     * @var ShipmentDAO $dao
     */
    private $shipment;
    private $db;
    private $user;
    private $dao;

    /**
     * Shipment Handler Class constructor
     *
     * @param Database $db   Database Instance.
     * @param User     $user User Instance.
     */
    function __construct(Shipment $shipment, \Database $db, \User $user)
    {
        $this->shipment = $shipment;
        $this->db       = $db;
        $this->user     = $user;
        $this->dao      = $this->getDataProvisioner();
        $this->validate();
    }

    /**
     * This method takes in a list of shipment and container arrays from the
     * front-end. The shipments are validated while the containers are
     * sent to their respective handler to be validated and saved. The ids of
     * the saved containers are set to the shipment instances which are then
     * sent to the DAO to be saved.
     *
     * @param array $shipmentArray a list of shipment and container arrays to be created.
     *
     * @return Shipment $shipment a list of shipment objects that were created.
     */
    public function createInstance() : Shipment
    {
        $this->validatePermission('create');
        return $this->dao->saveInstance($this->shipment);
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
        $shipment = new Shipment($shipmentArray);
        $this->validateInstance($shipment);
        return $this->dao->saveInstance($shipment);
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

    public function isValid() {
        return empty($this->errors);
    }

    public function getErrors() {
        return $this->errors;
    }

    /**
     * Validates Shipment Data before being saved
     *
     * @return void
     */
    private function validate() : void
    {
        $this->errors = [];
        $this->validateBarcode();
        $this->validateDestinationCenter();
        $this->validateLogs();
        $this->validateContainers();
    }

    /**
     * Validates Shipment Object Barcode.
     *
     * @return void
     */
    private function validateBarcode() : void
    {
        if (empty($this->shipment->getBarcode())) {
            $this->errors += ['barcode' => 'Barcode is required.'];
        }
    }

    /**
     * Validates Shipment Object Destination Center.
     */
    private function validateDestinationCenter() : void
    {
        if (empty($this->shipment->getDestinationCenter())) {
            $this->errors += ['destinationCenter' => 'Destination Center is required.'];
        }

        // TODO: Check that Destination Center is an actual center.
    }

    /**
     * Validates Shipment Object Containers
     *
     * @return void
     */
    private function validateContainers() : void
    {
        if (empty($this->shipment->getContainers())) {
            $this->errors += ['containers' => 'Atleast 1 container must be selected.'];
        }

        // TODO: Make sure that all containers are the same location and that
        // they are the same as the log creation center!
    }

    /**
     * Validates Shipment Object Logs.
     *
     * @return void
     */
    private function validateLogs() : void
    {
        $logs = $this->shipment->getLogs();
        foreach ($logs as $i=>$log) {
            $this->validateCenter($log, $i);
            $this->validateStatus($log, $i);
            $this->validateUser($log, $i);
            $this->validateTemperature($log, $i);
            $this->validateDate($log, $i);
            $this->validateTime($log, $i);
        }
    }

    /**
     * Validates Shipment Log Center.
     *
     * @param array $log Log to be validated.
     * @param int   $i
     *
     * @return void
     */
    private function validateCenter(array $log, int $i) : void
    {
        if (empty($log['center'])) {
            $this->errors['logs'][$i] = ['center' => 'Center is required.'];
        }
    }

    /**
     * Validates Shipment Log Status.
     *
     * @param array $log Log to be validated.
     * @param int   $i
     *
     * @return void
     */
    private function validateStatus(array $log, int $i) : void
    {
        if (empty($log['status'])) {
            $this->errors['logs'][$i] = ['status' => 'Status is required.'];
        }
    }

    /**
     * Validates Shipment Log Center.
     *
     * @param array $log Log to be validated.
     * @param int   $i
     *
     * @return void
     */
    private function validateUser(array $log, int $i) : void
    {
        if (empty($log['user'])) {
            $this->errors['logs'][$i] = ['user' => 'User is required.'];
        }
    }

    /**
     * Validates Shipment Log Temperature.
     *
     * @param array $log Log to be validated.
     * @param int   $i
     *
     * @return void
     */
    private function validateTemperature(array $log, int $i) : void
    {
        if (empty($log['temperature'])) {
            $this->errors['logs'][$i] = ['temperature' => 'Temperature is required.'];
        }
    }

    /**
     * Validates Shipment Log Date.
     *
     * @param array $log Log to be validated.
     * @param int   $i
     *
     * @return void
     */
    private function validateDate(array $log, int $i) : void
    {
        if (empty($log['date'])) {
            $this->errors['logs'][$i] = ['date' => 'Date is required.'];
        }
    }

    /**
     * Validates Shipment Log Time.
     *
     * @param array $log Log to be validated.
     * @param int   $i
     *
     * @return void
     */
    private function validateTime(array $log, int $i) : void
    {
        if (empty($log['time'])) {
            $this->errors['logs'][$i] = ['time' => 'Time is required.'];
        }
    }
}
