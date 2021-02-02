<?php declare(strict_types=1);
/**
 * Shipment Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Shipment Object instances.
 *
 * PHP Version 7.2
 *
 * @category   Entity
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
namespace LORIS\biobank;

/**
 * Shipment Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Shipment Object instances.
 *
 * PHP Version 7.2
 *
 * @category   Entity
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://www.github.com/aces/Loris/
 */
class Shipment implements \JsonSerializable, \LORIS\Data\DataInstance
{
    /**
     * Persistent Instance variables.
     *
     * These properties describe a shipment entity.
     *
     * @var string  $id
     * @var string  $barcode
     * @var string  $originCenter
     * @var string  $destinationCenter
     * @var array   $containers
     * @var array   $logs
     */
    private $id;
    private $barcode;
    private $originCenter;
    private $destinationCenter;
    private $status;
    private $containers;
    private $logs;

    /**
     * Initiliazes a new instance of the Shipment Class
     */
    function __construct(array $data)
    {
        isset($data['id']) && $this->setId((int) ($data['id']));                                              
        $this->setBarcode((string) $data['barcode']);
        $this->setDestinationCenter((string) $data['destinationCenter']);
        $this->setContainers((array) $data['containers']);
        $this->setLogs((array) $data['logs']);

        $originCenter = $this->logs[0]['center'];
        $status = $this->logs[array_key_last($this->logs)]['status'];
        $this->setOriginCenter((string) $originCenter);
        $this->setStatus((string) $status);
    }

    /**
     * Sets the shipment's ID
     *
     * @param int $id the shipment's ID
     *
     * @return void
     */
    private function setId(int $id) : void
    {
        if ($id > 0) {
            $this->id = $id;
        }
    }

    /**
     * Gets the shipment's ID
     *
     * @return ?int
     */
    public function getId() : ?int
    {
        return $this->id;
    }

    /**
     * Sets the tracking number of the shipment
     *
     * @param string $barcode the shipment's tracking number
     *
     * @return void
     */
    private function setBarcode(string $barcode) : void
    {
        $this->barcode = $barcode;
    }

    /**
     * Gets the tracking number of the shipment
     *
     * @return string
     */
    public function getBarcode() : string
    {
        return $this->barcode;
    }

    /**
     * Sets the origin center of the shipment
     *
     * @param string $originCenter the shipment's origin center
     *
     * @return void
     */
    private function setOriginCenter(string $originCenter) : void
    {
        $this->originCenter = $originCenter;
    }

    /**
     * Gets the origin center of the shipment
     *
     * @return string
     */
    public function getOriginCenter() : string
    {
        return $this->originCenter;
    }

    /**
     * Sets the destination center of the shipment
     *
     * @param string $destinationCenter the shipment's destination center
     *
     * @return void
     */
    private function setDestinationCenter(string $destinationCenter) : void
    {
        $this->destinationCenter = $destinationCenter;
    }

    /**
     * Gets the destination center of the shipment
     *
     * @return string
     */
    public function getDestinationCenter() : string
    {
        return $this->destinationCenter;
    }

    /**
     * Sets the status of the shipment
     *
     * @param string $status
     *
     * @return void
     */
    private function setStatus(string $status) : void
    {
        $this->status = $status;
    }

    /**
     * Gets the status of the shipment
     *
     * @return string
     */
    public function getStatus() : string
    {
        return $this->status;
    }

    /**
     * Sets the containers for the shipment
     *
     * @param array $containers the shipment's containers
     *
     * @return void
     */
    private function setContainers(array $containers) : void
    {
        $this->containers = $containers;
    }

    /**
     * Gets the containers of the shipment
     *
     * @return array
     */
    public function getContainers() : array
    {
        return $this->containers;
    }

    /**
     * Sets the logs for the shipment
     *
     * @param array $logs the shipment's logs
     *
     * @return void
     */
    private function setLogs(array $logs) : void
    {
        $this->logs = $logs;
    }

    /**
     * Gets the logs of the shipment
     *
     * @return array
     */
    public function getLogs() : array
    {
        return $this->logs;
    }
                                                                                
    /**                                                                         
     * A wrapper function for the jsonSerialize method of the Shipment Instance 
     * Class. This converts the Shipment Instance into an array.                
     *                                                                          
     * @return array Shipment Array.                                                
     */                                                                         
    public function toArray() : array                    
    {                                                                           
        return $this->jsonSerialize();                                          
    }  

    /**
     * Returns an array representing the state of the Shipment
     *
     * @return array
     */
    public function jsonSerialize() : array
    {
        return array(
                'id'                => $this->id,
                'barcode'           => $this->barcode,
                'originCenter'      => $this->originCenter,
                'destinationCenter' => $this->destinationCenter,
                'containers'        => $this->containers,
                'status'            => $this->status,
                'logs'              => $this->logs,
               );
    }

    /**
     * Returns a JSON encoded string of the state of the Shipment
     *
     * @return string JSON encoded string of Shipment data
     */
    public function toJSON() : string
    {
        return json_encode($this);
    }
}

