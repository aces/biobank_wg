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
     * @var string    $id
     * @var string    $trackingNumber
     * @var string    $originCenter
     * @var string    $destinationCenter
     */
    private $id;
    private $trackingNumber;
    private $originCenter;
    private $destinationCenter;

    /**
     * Initiliazes a new instance of the Shipment Class
     */
    function __construct()
    {
    }

    /**
     * Sets the shipment's ID
     *
     * @param int $id the shipment's ID
     *
     * @return void
     */
    public function setId(int $id) : void
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
     * @param string $trackingNumber the shipment's tracking number
     *
     * @return void
     */
    public function setTrackingNumber(string $trackingNumber) : void
    {
        $this->trackingNumber = $trackingNumber;
    }

    /**
     * Gets the tracking number of the shipment
     *
     * @return string
     */
    public function getTrackingNumber() : string
    {
        return $this->trackingNumber;
    }

    /**
     * Sets the origin center of the shipment
     *
     * @param string $originCenter the shipment's origin center
     *
     * @return void
     */
    public function setOriginCenter(string $originCenter) : void
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
    public function setDestinationCenter(string $destinationCenter) : void
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
     * Loads a Shipment Object from an array.
     *                                                                          
     * @param array $data Data to be used to load the Shipment Object.             
     *                                                                          
     * @return Shipment                             
     */                                                                         
    public function fromArray(array $data) : Shipment                    
    {                                                                           
        $this->setId((int) ($data['id']));                                              
        $this->setTrackingNumber((string) $data['trackingNumber']);
        $this->setOriginCenter((string) $data['originCenter']);                            
        $this->setDestinationCenter((string) $data['destinationCenter']);

        return $this;                                                           
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
                'trackingNumber'    => $this->trackingNumber,
                'originCenter'      => $this->originCenter,
                'destinationCenter' => $this->destinationCenter,
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

