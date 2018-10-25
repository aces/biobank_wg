<?php
/**
 * Specimen Object Class
 * This class contains an instance of a database handling that is needed to
 * permanently store and retrieve Specimen Object instances.
 *
 * PHP Version 7.2
 *
 * @category Loris
 * @package  Biobank
 * @author   Henri Rabalais <hrabalais.mcin@gmail.com>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris/
 */

namespace LORIS\biobank;

class Collection extends Process 
{
    /**
     * Persistent Instance variables.
     *
     * These variables are directly mapped to the fields of the database schema
     * that describe a specimen entity.
     *
     * @access private
     */
    private $quantity; //float
    private $unitId;   //int

    /**
     * Sets the current amount of specimen available
     *
     * @param float $quantity the current amount of specimen available
     *
     * @return void
     */
    public function setQuantity(float $quantity) : void
    {
        $this->quantity = $quantity;
    }

    /**
     * Gets the current amount of specimen available
     *
     * @return float
     */
    public function getQuantity() : float
    {
        return $this->quantity;
    }

    /**
     * Sets the ID of the specimen's unit of quantity
     *
     * @param string $unitId the ID of the quantity's unit
     *
     * @return void
     */
    public function setUnitId(int $unitId) : void
    {
        $this->unitId = $unitId;
    }

    /**
     * Gets the ID of the specimen's unit of quantity
     *
     * @return string
     */
    public function getUnitId() : int
    {
        return $this->unitId;
    }

    /*
     * Returns an array representing the state of the Specimen.
     *
     * @return array
     */
    public function jsonSerialize() : array
    {
        $parent = parent::jsonSerialize();
        return array_merge($parent,
            array(
                'quantity' => $this->quantity,
                'unitId'   => $this->unitId,
            )
        );
    }
}
?>