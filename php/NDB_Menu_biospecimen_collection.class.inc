<?php
/**
 * Form_biobanking class file
 *
 * PHP version 5
 *
 * @category   Main
 * @package    Biobanking
 * @author     Loris Team <loris.mni@bic.mni.mcgill.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://github.com/aces/Loris
 */
require_once 'NDB_Menu.class.inc';

/**
 * NDB_Form_Genomic_Browser Class
 *
 * This class is genomic_browser Form
 *
 * @category   Biobank
 * @package    Main
 * @subpackage Biobank
 * @author     John Saigle <jsaigle.mcin@gmail.com>
 * @license    http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link       https://github.com/aces/Loris
 */
class NDB_Menu_biospecimen_collection extends NDB_Menu
{
    var $candID;
    var $sessionID;

    /**
     * Determine whether the user has permission to view this page
     *
     * @return bool whether the user has access
     */
    function _hasAccess() {
        // TODO: Create biobanking-specific permissions
        $user =& User::singleton();
        $site =& Site::singleton($user->getData('CenterID'));
        $this->tpl_data['biobanking']
            = $user->hasPermission('view_biobanking') || $user->hasPermission('edit_biobanking');
        return $user->hasPermission('view_biobanking') || $user->hasPermission('edit_biobanking');
    }

    /**
     * Function to view detailed information on a specific biospecimen
     * Visit Label or SessionID not required
     *
     * @return NULL
     */
    function setup() {
        $this->DB = Database::singleton();
        $this->biospecimen_id = $_REQUEST['biospecimen_id'];
        // add check? if (!empty($this->genomic_file_ID) &&
        // is_numeric($this->genomic_file_ID)) {
        if (!empty($this->biospecimen_id) ) {
            $this->_setSpecimenData($this->biospecimen_id);
        }
        $this->tpl_data['has_permission'] = true;#($this->_hasAccess()) ? true : false;
    }

    /**
     * Sets values for Genomic data files
     *
     * @param string $category type of data: raw,cleaned,gwas
     *
     * @return NULL
     */
    function _setSpecimenData($biospecimen_id) {
        $info = $this->DB->pselect(
                "SELECT b.id,
                     b.subject_id,
                     b.nb_samples,
                     DATE_FORMAT(b.collection_date, '%d-%b-%Y') as collection_date,
                     b.time,
                     b.woke,
                     b.freezer_id,
                     b.bag_name,
                     b.buccal_rack_id,
                     b.buccal_rack_coordinates,
                     b.shelf_num,
                     b.rack_num,
                     b.box_name,
                     b.box_coordinates,
                     b.oragene_location,
                     b.collection_notes, 
                     DATE_FORMAT(b.subject_dob,'%d-%b-%Y') AS dob,
                     if(b.subject_id LIKE '%M', 'Mother', 'Child') AS participant_type,
                     if(b.subject_id LIKE 'JF%', 'Dr. Julien', 'Mavan') AS Project,
                     bt.type AS sample_type,
                     bs.status AS status,
                     br.name AS collection_ra
                FROM biospecimen b 
                JOIN biospecimen_type bt ON (bt.id=b.type_id)
                JOIN biospecimen_status bs ON (bs.id=b.status_id)
                LEFT JOIN biobanking_ra br ON (b.collection_ra_id=br.id)
                WHERE b.id=:id",
                $params = array('id' => $this->biospecimen_id)
                );        
$this->tpl_data['info'] = $info;
    }
}
?>
