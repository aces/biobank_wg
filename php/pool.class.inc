<?php declare(strict_types=1);
/**
 * Pool Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Pool Object instances.
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
 * Pool Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Pool Object instances.
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
class Pool implements \JsonSerializable, \LORIS\Data\DataInstance
{
    /**
     * Persistent Instance variables.
     *
     * These properties describe a pool entity.
     *
     * @var string    $id
     * @var string    $label
     * @var float     $quantity
     * @var string    $unit
     * @var array     $specimenIds
     * @var int       $candidateId
     * @var int       $sessionId
     * @var int       $typeId
     * @var string    $center
     * @var \DateTime $date
     * @var \DateTime $time
     */
    private $id;
    private $label;
    private $quantity;
    private $unit;
    private $specimenIds;
    private $candidateId;
    private $sessionId;
    private $typeId;
    private $center;
    private $date;
    private $time;

    /**
     * Initiliazes a new instance of the Pool Class
     */
    function __construct($data)
    {
        $this->setId((int) ($data['id']));                                              
        $this->setLabel((string) $data['label']);                                        
        $this->setQuantity((float) $data['quantity']);                            
        $this->setUnit((string) $data['unit']);                            
        $this->setSpecimenIds($data['specimenIds']);                            
        $this->setCandidateId((int) $data['candidateId']);                            
        $this->setSessionId((int) $data['sessionId']);                                
        $this->setTypeId((int) $data['typeId']);                                
        $this->setCenter((string) $data['center']);                                  
        $this->setDate(new \DateTime($data['date']));                           
        $this->setTime(new \DateTime($data['time']));                           
    }

    /**
     * Sets the pool's ID
     *
     * @param int $id the pool's ID
     *
     * @return void
     */
    public function setId(int $id) : void
    {
        $this->id = $id;
    }

    /**
     * Gets the pool's ID
     *
     * @return ?int
     */
    public function getId() : ?int
    {
        return $this->id;
    }

    /**
     * Sets the label of the pool
     *
     * @param string $label the pool's label
     *
     * @return void
     */
    public function setLabel(string $label) : void
    {
        $this->label = $label;
    }

    /**
     * Gets the label of the pool
     *
     * @return string
     */
    public function getLabel() : string
    {
        return $this->label;
    }

    /**
     * Sets the quantity of the pool
     *
     * @param float $quantity the pool's quantity
     *
     * @return void
     */
    public function setQuantity(float $quantity) : void
    {
        $this->quantity = $quantity;
    }

    /**
     * Gets the quantity of the pool
     *
     * @return float
     */
    public function getQuantity() : float
    {
        return $this->quantity;
    }

    /**
     * Sets the Unit of the pool
     *
     * @param int $unit Unit of the pool
     *
     * @return void
     */
    public function setUnit(string $unit) : void
    {
        $this->unit = $unit;
    }

    /**
     * Gets the Unit of the pool
     *
     * @return string
     */
    public function getUnit() : string
    {
        return $this->unit;
    }

    /**
     * Sets the Specimen IDs of the pool
     *
     * @param array $specimenIds Specimen IDs of the pool
     *
     * @return void
     */
    public function setSpecimenIds(array $specimenIds) : void
    {
        $this->specimenIds = $specimenIds;
    }

    /**
     * Gets the Specimen IDs of the pool
     *
     * @return array
     */
    public function getSpecimenIds() : array
    {
        return $this->specimenIds;
    }

    /**
     * Sets the Candidate ID of the pool
     *
     * @param int $candidateId Candidate ID of the pool
     *
     * @return void
     */
    public function setCandidateId(int $candidateId) : void
    {
        $this->candidateId = $candidateId;
    }

    /**
     * Gets the Candidate ID of the pool
     *
     * @return ?int
     */
    public function getCandidateId() : ?int
    {
        return $this->candidateId;
    }

    /**
     * Sets the Session ID of the pool
     *
     * @param ?int $sessionId Session ID of the pool
     *
     * @return void
     */
    public function setSessionId(?int $sessionId) : void
    {
        $this->sessionId = $sessionId;
    }

    /**
     * Gets the Session ID of the pool
     *
     * @return ?int
     */
    public function getSessionId() : ?int
    {
        return $this->sessionId;
    }

    /**
     * Sets the Type ID of the pool
     *
     * @param ?int $typeId Type ID of the pool
     *
     * @return void
     */
    public function setTypeId(?int $typeId) : void
    {
        $this->typeId = $typeId;
    }

    /**
     * Gets the Type ID of the pool
     *
     * @return ?int
     */
    public function getTypeId() : ?int
    {
        return $this->typeId;
    }

    /**
     * Sets the Center of the pool
     *
     * @param array $center Center of the pool
     *
     * @return void
     */
    public function setCenter(string $center) : void
    {
         $this->center = $center;
    }

    /**
     * Gets the Center of the pool
     *
     * @return string
     */
    public function getCenter() : int
    {
        return $this->center;
    }

    /**
     * Sets the date at which the pool was created.
     *
     * @param \DateTime $date the date of the pool
     *
     * @return void
     */
    public function setDate(\DateTime $date) : void
    {
        $this->date = $date;
    }

    /**
     * Gets the date that the pool was created.
     *
     * @return \DateTime
     */
    public function getDate() : \DateTime
    {
        return $this->date;
    }

    /**
     * Sets the time at which the pool was created.
     *
     * @param \DateTime $time the time of the pool
     *
     * @return void
     */
    public function setTime(\DateTime $time) : void
    {
        $this->time = $time;
    }

    /**
     * Gets the time of pool at which the pool was created.
     *
     * @return \DateTime
     */
    public function getTime() : \DateTime
    {
        return $this->time;
    }
                                                                                
    /**                                                                         
     * A wrapper function for the jsonSerialize method of the Pool Instance 
     * Class. This converts the Pool Instance into an array.                
     *                                                                          
     * @return array Pool Array.                                                
     */                                                                         
    public function toArray() : array                    
    {                                                                           
        return $this->jsonSerialize();                                          
    }  

    /**
     * Returns an array representing the state of the Pool.
     *
     * @return array
     */
    public function jsonSerialize() : array
    {
        // TODO: Date and Time formats should be gotten from some sort of
        // config setting.
        return array(
                'id'          => $this->id,
                'label'       => $this->label,
                'quantity'    => $this->quantity,
                'unit'        => $this->unit,
                'specimenIds' => $this->specimenIds,
                'candidateId' => $this->candidateId,
                'sessionId'   => $this->sessionId,
                'typeId'      => $this->typeId,
                'center'      => $this->center,
                'date'        => $this->date->format('d-m-Y'),
                'time'        => $this->time->format('H:i'),
               );
    }

    /**
     * Returns a JSON encoded string of the state of the Pool
     *
     * @return string JSON encoded string of Pool data
     */
    public function toJSON() : string
    {
        return json_encode($this);
    }
}

