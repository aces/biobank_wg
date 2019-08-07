<?php

/**
 * This script import samples data from Tissus Metrix data (Oracle DB)
 * and import them in the BioBank extension of LORIS database.
 *
 * If a sample is already in LORIS DB, it will update the information.
 * Candidate and session informations are inserted if necessairy but not
 * updated if already present.
 *
 * Usage: php tm2loris.php userID [confirm]
 *
 * PHP Version 7.2
 *
 * @category Module
 * @package  BioBank-wg
 * @author   Mélanie Legault <melanie.legault2@mcgill.ca>
 * @license  Loris license
 * @link     https://www.github.com/aces/biobank_wg/
 */

//TODO list:
// adjust reading csv (excel?) file as needed
// 
// Add examinerID in biobank_specimen_XYZ  (Need to create users for CRU members)
// 
// Box size (2) for cryotank (CRYO-08S) for 5x5, others are 10x10
// 
// add date collected or processed in specimen windows


require_once __DIR__ ."/cred.inc";  //Oracle DB credential
require_once __DIR__ . "/../../../vendor/autoload.php";
require_once "../../../tools/generic_includes.php";
//require_once 'Database.class.inc';
//require_once 'Utility.class.inc';

//define the command line parameters
$userID = "";
if (count($argv) < 2 || $argv[1] == 'help') {
    showHelp();
}
$userID = $argv[1];

$DB =& \Database::singleton();

//check user credential
$userPWD = readlineTerminal("\nPlease enter your LORIS password");
echo "\n";
$auth = new SinglePointLogin;

if (!$auth->passwordAuthenticate($userID, $userPWD, false)) {
    echo "\nInvalid userID, password combination\n";
    exit(1);
}


// connect to the Oracle DB
$orConn = oci_connect($user, $passwd, $service, 'AL32UTF8');
if (!$orConn) {
    $e = oci_error();
    print "Error!: " . $e->getMessage();
    exit(2);
}

$stid = oci_parse($orConn, 'ALTER SESSION SET CURRENT_SCHEMA = '.$schema);
if (!oci_execute($stid)) {
    $e = oci_error();
    print "Error!: " . $e->getMessage();
    exit(2);
}

//insert default centerID
$centerID = $DB->pselectOne(
    "SELECT CenterID FROM psc
     WHERE Name = :centerName",
    array('centerName' => $defaultCenterName['Name'])
);
if (!$centerID) {
    $centerID = insertCenter($defaultCenterName);
}

$newCandID = $DB->pselectOne(
            "SELECT max(CandID) + 1
             FROM candidate",
            array()
        );
$newCandID = is_null($newCandID) ? 100000 : $newCandID;

$projectID = getProjectID("CBigR");
//get the list of ID for json attributes in LORIS DB
$jsonIDs = getJsonID($jsonAttributes);

// get the list of candidate to process and process
// csv format = TM_donors.donor_number, LORISID (PSCID)
if (($handle = fopen("testcandidate.csv", "r")) !== false) {
    $orQuery = "SELECT S.SAMPLE_NUMBER, SAMPLE_TYPE, S.DISEASE_CODE, FT_CYCLES,
        to_char(PREP_DATE, 'YYYY-MM-DD') as PREP_DATE,
        PREP_BY, STORAGE_STATUS, s.INSTITUTION, COLLECTED_BY, QTY_UNITS,
        SITE_OF_TISSUE, STORAGE_ADDRESS, QTY_ON_HAND, SAMPLE_CATEGORY,
        to_char(COLLECTION_DATE, 'YYYY-MM-DD') as COLLECTION_DATE, SITE_CODE,
        S.COMMENTS, D.SEX, FILE1,
        to_char(DATE_OF_BIRTH, 'YYYY-MM-DD') as DATE_OF_BIRTH,
        s.DONOR_ID, s.EVENT_ID, e.EVENT_NAME,
        to_char(e.EVENT_DATE,'YYYY-MM-DD') as EVENT_DATE, S.BANK_ID, BANK_NAME
    FROM TM_SAMPLES S 
    LEFT JOIN TM_DONORS D ON S.DONOR_ID = D.DONOR_ID 
    LEFT JOIN TM_DONOR_EVENTS e ON s.EVENT_ID = e.EVENT_ID
    LEFT JOIN TM_BANKS B on s.BANK_ID = B.BANK_ID
    WHERE D.DONOR_number = :tmID";
    $stid    = oci_parse($orConn, $orQuery);
    while (($data = fgetcsv($handle)) !== false) {
        // check if candidate exist
        $candidate = $DB->pselectOne(
            "SELECT CandID
             FROM candidate
             WHERE PSCID = :pscID AND RegistrationCenterID = :centerID",
            array(
             'pscID'   => $data[1],
             'centerID' => $centerID,
            )
        );

//        if (!$candidate) {
//            throw new LorisException('Candidate not define in LORIS'); //TODO to refine
//        }

$NBCand=0;

        oci_bind_by_name($stid, ":tmID", $data[0]);
        oci_execute($stid);
        while (($tmRow = oci_fetch_assoc($stid)) != false ) {


        if (empty($candidate['CandID']) && empty($candidate)) {
            $candidate = insertCandidate($tmRow, $data[1], $newCandID++, $centerID, $userID, $projectID);
        }

        adjustAttribute($tmRow);
            // check if sample already exist in Loris
            $sampleExist = $DB->pselectOne(
                "SELECT COUNT(ContainerID)
                 FROM biobank_container
                 WHERE Barcode = :barcode",
                array(':barcode' => $tmRow['SAMPLE_NUMBER'])
            );
            if ($sampleExist != 0) {
                updateSample($tmRow, $centerID);
            } else {
                // check if session exist
                $session['Visit_label'] = $tmRow['EVENT_NAME'];
                $session['ID']          = $DB->pselectOne(
                    "SELECT ID
                     FROM session
                     WHERE CandID = :candID AND Visit_label = :visit",
                    array(
                     ':candID' => $candidate,
                     ':visit'  => $session['Visit_label'],
                    )
                );
                if (!$session['ID']) {
                    $session['ID'] = insertSession(
                        $tmRow,
                        $candidate,
                        $userID,
                        $centerID
                    );
                }
                if ((substr($tmRow['STORAGE_ADDRESS'], 0, 7) != 'VIRTUAL') && 
                    (substr($tmRow['STORAGE_ADDRESS'], 0, 5) != 'FRZ00')) {
                    insertSample($tmRow, $candidate, $centerID, $session['ID'], $projectID);
                }
            }
            unset($tmRow);
        }
    }
    fclose($handle);
}

/**
 * Insert a candidate into LORIS
 * @param array $tmRow     row of data for Oracle DB
 * @param array $candidate row of data for Oracle DB
 *
 * @return void
 */
function insertCandidate(array $tmRow, string $pscid, int $newCandID, int $centerID, string $userID, int $projectID) : int
{
    $DB =& \Database::singleton();

    $candidate['CandID']               = $newCandID;
    $candidate['PSCID']                = $pscid;
    $candidate['active']               = 'Y';
    $candidate['RegistrationCenterID'] = $centerID;
    $candidate['UserID']               = $userID; // from TM
    $candidate['Testdate']             = $tmRow['EVENT_DATE']; // from TM
    $candidate['Entity_type']          = 'Human';
    $candidate['ProjectID']            = $projectID;

   $DB->insert("candidate", $candidate);
   $ID = $DB->getLastInsertID();

   return $DB->pselectOne(
            "SELECT CandID
             FROM candidate
             WHERE ID = :ID",
            array(
             'ID'   => $ID,
            )
        );
}

/**
 * Helper function to get the Loris password of the user
 *
 * @param string $prompt message to send on tty
 *
 * @return string the password.
 */
function readlineTerminal($prompt = '')
{
    $prompt && print $prompt;
    $terminal_device = '/dev/tty';
    $h = fopen($terminal_device, 'r');
    if ($h === false) {
        //throw new RuntimeException("Failed to open terminal
        //                            device $terminal_device");
        return false; // probably not running in a terminal.
    }
    `/bin/stty -echo`;
    $line = rtrim(fgets($h), "\r\n");
    `/bin/stty echo`;
    fclose($h);
    return $line;
}

/**
 * Show the help message on the terminal
 *
 * @return void
 */
function showHelp()
{
    echo "***Import samples data from Tissus Metrix***\n\n";
    echo "Usage: php tm2loris.php userID [confirm]\n\n";
    echo "If confirm is used, the data will be pushed to the LORIS database.\n";
    echo "If not, a count of how many samples, candidate, and session\n";
    echo "information to be added or updated will be shown.\n";

    exit(1);
}

/**
 * Insert the session information for a sample
 *
 * @param array $tmRow    row of data for Oracle DB
 * @param int   $candID   the candidate ID
 * @param int   $userID   the userID of the person running the script
 * @param int   $centerID the ID of the center where the sample where collected
 *
 * @return void
 */
function insertSession($tmRow, $candID, $userID, $centerID)
{
    $DB =& \Database::singleton();

    $today = date('Y-m-d');

    // check if subproject exist
    $session['SubprojectID'] = $DB->pselectOne(
        "SELECT SubprojectID
         FROM subproject
         WHERE title = :bankName",
        array(':bankName' => $tmRow['BANK_NAME'])
    );
    if (!$session['SubprojectID']) {
        $session['SubprojectID'] = insertSubproject($tmRow['BANK_NAME']);
    }

    $session           = array();
    $session['CandID'] = $candID;
    $session['CenterID']          = $centerID;
    $session['Active']            = 'Y';
    $session['UserID']            = $userID;
    $session['Visit']             = 'In Progress';
    $session['Hardcopy_request']  = '-';
    $session['MRIQCStatus']       = '';
    $session['MRIQCPending']      = 'N';
    $session['MRICaveat']         = 'false';
    $session['Visit_label']       = $tmRow['EVENT_NAME'];
    $session['Submitted']         = 'N';
    $session['Current_stage']     = 'visit';
    $session['Date_stage_change'] = $today;
    $session['date_registered']   = $today;
    $session['scan_done']         = 'N';
    $session['Date_active']       = $tmRow['EVENT_DATE'];

    $DB->insert("session", $session);
    return $DB->getLastInsertID();
}

/**
 * Insert a sample and location. Build the container as required
 *
 * @param array $tmRow     row of data for Oracle DB
 * @param int   $candID    the candidate ID
 * @param int   $centerID  the ID of the center where the sample where collected
 * @param int   $sessionID the ID of the session
 *
 * @return bool succes of the insertion
 */
function insertSample(array $tmRow, int $candID, $centerID, $sessionID, $projectID)
{
    $DB =& \Database::singleton();

    $sql = 'SELECT ContainerStatusID
            FROM biobank_container_status
            WHERE Label = "Available"';
    $containerStatusID = $DB->pselectOne($sql, array());

    $sample = array();
    $sample['ContainerStatusID'] = $containerStatusID;
    $sample['OriginCenterID']    = $centerID;
    $sample['CurrentCenterID']   = $centerID;
    $sample['DateTimeCreate']    = $tmRow['COLLECTION_DATE'];

    // insert containers
    $tmLocation  = explodeLocation(
        $tmRow['STORAGE_ADDRESS'],
        $tmRow['SAMPLE_NUMBER']
    );
    $containerID = insertContainerStack($tmLocation, $sample, $projectID);
    // insert the aliquot
    $index       = sizeof($tmLocation)-1;
    $containerID = insertContainer($tmLocation[$index], $sample, $containerID, true, $tmRow['STORAGE_STATUS'], $projectID);
    // insert specimen
    $specimenID = insertSpecimen(
        $tmRow,
        $containerID,
        $candID,
        $sessionID,
        $centerID
    );
}

/**
 * Insert explode a storage location in various container
 *
 * @param string $storageAdress from TM Oracle DB
 * @param string $barcode       barcode of the aliquot
 *
 * @return array the explode location
 */
function explodeLocation(string $storageAdress, string $barcode) : array
{
    $tmLocation    = array();
    $locationSplit = explode('-', $storageAdress);
    switch (substr($locationSplit[0], 0, 3)) {
        case 'FRZ':
            if ((int)substr($locationSplit[1], 3) < 9) {
                $tmLocation[0]['Label'] = 'Freezer - 5 Shelf';
                $tmLocation[1]['Label'] = 'Shelf - 6 Rack';
                $tmLocation[2]['Label'] = 'Rack - 16 Box';
                $tmLocation[3]['Label'] = 'Matrix Box - 10x10';
                $tmLocation[4]['Label'] = 'Cryotube Vial';
            } else {
                $tmLocation[0]['Label'] = 'Freezer - 3 Shelf';
                $tmLocation[1]['Label'] = 'Shelf - 7 Rack';
                $tmLocation[2]['Label'] = 'Rack - 28 Box';
                $tmLocation[3]['Label'] = 'Matrix Box - 10x10';
                $tmLocation[4]['Label'] = 'Cryotube Vial';
            }
            $tmLocation[0]['type']     = 'Freezer';
            $tmLocation[0]['barcode']  = $locationSplit[0];
            $tmLocation[0]['location'] = substr($locationSplit[0], 3);
            $tmLocation[0]['Temperature'] = -80;

            $tmLocation[1]['type']     = 'Shelf';
            $tmLocation[1]['barcode']  = $tmLocation[0]['barcode'].'-'.
                $locationSplit[1];
            $tmLocation[1]['location'] = substr($locationSplit[1], 1);
            $tmLocation[1]['Temperature'] = -80;


            $tmLocation[2]['type']     = 'Rack';
            $tmLocation[2]['barcode']  = $tmLocation[1]['barcode'].'-'.
                $locationSplit[2];
            $tmLocation[2]['location'] = substr($locationSplit[2], 1);
            $tmLocation[2]['Temperature'] = -80;


            $tmLocation[3]['type']     = 'Matrix Box';
            $tmLocation[3]['barcode']  = $tmLocation[2]['barcode'].'-'.
                $locationSplit[3];
            $tmLocation[3]['location'] = substr($locationSplit[3], 1);
            $tmLocation[3]['Temperature'] = -80;


            $tmLocation[4]['type']     = 'Tube';
            $tmLocation[4]['barcode']  = $barcode;
            $tmLocation[4]['location'] = $locationSplit[4];
            $tmLocation[4]['Temperature'] = -80;

            break;

        case 'CRY':
            $tmLocation[0]['Label'] = 'LN2 Tank';
            $tmLocation[0]['type']       = 'CryoTank';
            $tmLocation[0]['barcode']    = 'CRYO-'.$locationSplit[1];
            $tmLocation[0]['location']   = $locationSplit[1];
            $tmLocation[0]['Temperature'] = -196;


            $tmLocation[1]['Label'] = 'LN2 Rack - 10x10 box';
            $tmLocation[1]['type']       = 'Rack';
            $tmLocation[1]['barcode']    = $tmLocation[0]['barcode'].'-'.
                $locationSplit[2];
            $tmLocation[1]['location']   = substr($locationSplit[2], 1);
            $tmLocation[1]['Temperature'] = -196;


            $tmLocation[2]['Label'] = 'Matrix Box - 10x10';
            $tmLocation[2]['type']       = 'Matrix Box';
            $tmLocation[2]['barcode']    = $tmLocation[1]['barcode'].'-'.
                $locationSplit[3];
            $tmLocation[2]['location']   = substr($locationSplit[3], 1);
            $tmLocation[2]['Temperature'] = -196;


            $tmLocation[3]['Label'] = 'Cryotube Vial';
            $tmLocation[3]['type']       = 'Tube';
            $tmLocation[3]['barcode']    = $barcode;
            $tmLocation[3]['location']   = $locationSplit[4];
            $tmLocation[3]['Temperature'] = -196;



            break;

        case 'VIR':
            $storageType = 'VIRTUAL';
            break;
        default:
    }
    return $tmLocation;
}

/**
 * Update the information for a sample.
 * check and modify as required:
 * - container location
 * - quantity
 * - freeze thaw cycle
 *
 * @param array $tmRow    row of data for Oracle DB
 * @param int   $centerID the ID of the center
 *
 * @return bool succes of the insertion
 */
function updateSample(array $tmRow, $centerID)
{
    $DB =& \Database::singleton();

    $sql     = "SELECT bs.SpecimenID, bs.Quantity, bc.Barcode, FreezeThawCycle,
            bs.ContainerID as AliquotID, bc2.Barcode as ParentBarcode
        FROM biobank_specimen bs
        JOIN biobank_container bc ON bs.ContainerID = bc.ContainerID
        JOIN biobank_container_parent bcp on bc.ContainerID = bcp.ContainerID
        JOIN biobank_container bc2 ON bcp.ParentContainerID = bc2.ContainerID
        LEFT JOIN biobank_specimen_freezethaw bsf ON bs.SpecimenID = bsf.SpecimenID
        WHERE bc.Barcode = :barcode";
    $current = $DB->pselectRow($sql, array('barcode' => $tmRow['SAMPLE_NUMBER']));

    // check quantity and update if needed
    if ($current['Quantity'] != $tmRow['QTY_ON_HAND']) {
        //exception for null unit
        if (is_null($tmRow['QTY_UNITS']) && $tmRow['SAMPLE_TYPE'] == 'DNA') {
            $tmRow['QTY_UNITS'] = "µL";
            echo "Qty_Units null, DNA, assuming µL\n";
        }
        elseif (is_null($tmRow['QTY_UNITS']) && $tmRow['SAMPLE_TYPE'] == 'Trizol lysate') {
            $tmRow['QTY_UNITS'] = "10⁶/mL";
            echo "Qty_Units null, Trizol lysate, assuming 10⁶/mL\n";
        }

        $DB->update(
            'biobank_specimen',
            array(
             'Quantity' => $tmRow['QTY_ON_HAND'],
             'UnitID'   => getUnitID($tmRow['QTY_UNITS']),
            ),
            array('SpecimenID' => $current['SpecimenID'])
        );
    }

    // check location and update if needed
    $newParent     = substr($tmRow['STORAGE_ADDRESS'], 0, -4);
    $newCoordinate = substr($tmRow['STORAGE_ADDRESS'], -3);
    if ($current['ParentBarcode'] != $newParent) {
        // check if new base container exist
        $sql = "SELECT bc.ContainerID
            FROM biobank_container bc
            WHERE bc.Barcode = :newParent";
        $newParentContainerID = $DB->pselectOne(
            $sql,
            array('newParent' => $newParent)
        );
        if (empty($newParentContainerID)) {
            $sql = 'SELECT ContainerStatusID
                FROM biobank_container_status
                WHERE Label = "Available"';
            $containerStatusID = $DB->pselectOne($sql, array());

            $sample = array();
            $sample['ContainerStatusID'] = $containerStatusID;
            $sample['OriginCenterID']    = $centerID;
            $sample['CurrentCenterID']   = $centerID;
            $sample['DateTimeCreate']    = $tmRow['COLLECTION_DATE'];

            $tmLocation           = explodeLocation(
                $tmRow['STORAGE_ADDRESS'],
                $tmRow['SAMPLE_NUMBER']
            );
            $newParentContainerID = insertContainerStack($tmLocation, $sample, $projectID);
        } else {
            //check if location is empty
            $sql = "SELECT bc.ContainerID, bcp.ParentContainerID
                FROM biobank_container bc
                LEFT JOIN biobank_container_parent bcp
                WHERE bc.Barcode = :newLocation
                AND bcp.Coordinate = :coordinate";
            $newParentContainer = $DB->pselectCol(
                $sql,
                array(
                 'newLocation' => $newParent,
                 'coordinate'  => $newCoordinate,
                )
            );
            if (!empty($newParentContainer)) {
                //coordinate occupied
                throw new LorisException('new coordinate occupied'); //TODO to refine
            }
        }
        // update aliquot location
        $DB->update(
            'biobank_container_parent',
            array(
             'ParentContainerID' => $newParentContainerID,
             'Coordinate'        => $newCoordinate,
            ),
            array('ContainerID' => $current['AliquotID'])
        );
    }

    // check FreezeThawCycle and update if needed
    if ($tmRow['FT_CYCLES'] != 0
        && ( $current['FreezeThawCycle'] != $tmRow['FT_CYCLES'])
    ) {
        $DB->replace(
            'biobank_specimen_freezethaw',
            array(
             'SpecimenID'      => $current['SpecimenID'],
             'FreezeThawCycle' => $tmRow['FT_CYCLES'],
            )
        );
    }

}

/**
 * Insert a parent container stack
 * create a line of container starting with the freezer up to the aliquot
 * as needed with the parent relation if applicable
 *
 * @param array $tmLocation row of data for Oracle DB
 * @param int   $sample     the candidate ID
 *
 * @return int the ContainerID of the box
 */
function insertContainerStack(array $tmLocation, $sample, $projectID) : int
{

    // top level container
    $containerID = insertContainer($tmLocation[0], $sample, null, false, null, $projectID);
    // shelf, rack and box
    $size = count($tmLocation);
    $statusID = getContainerStatus('Available');
    for ($i = 1; $i < $size - 1; $i++) {
        $containerID = insertContainer(
            $tmLocation[$i],
            $sample,
            $containerID,
            false,
            $statusID,
            $projectID
        );
    }
    return $containerID;
}

/**
 * Insert a container if it not already exist
 * create the parent relation if applicable
 *
 * @param array $container row of data for Oracle DB
 * @param int   $sample    the candidate ID
 * @param int   $parent    the userID of the person running the script
 * @param bool  $exclusive report an error if already exist
 *
 * @return int the ContainerID
 */
function insertContainer(
    array $container,
    $sample,
    $parent = null,
    $exclusive = true,
    $statusID = null,
    $projectID
) : int {
    $DB =& \Database::singleton();

    //check if already exist
    $sql   = "SELECT ContainerID FROM biobank_container WHERE Barcode = :barcode";
    $exist = $DB->pselectOne($sql, array('barcode' => $container['barcode']));

    if (!empty($exist)) {
        if ($exclusive === true) {
            throw new LorisException('Barcode already taken');
        } else {
            return $exist;
        }
    }
    //not existant, add
    $sql = 'SELECT ContainerTypeID
            FROM biobank_container_type
            WHERE Label = :Label';
    $containerTypeID = $DB->pselectOne(
        $sql,
        array(
         'Label' => $container['Label'],
        )
    );
print("label: {$container['Label']}\n");    
    $sample['Barcode']           = $container['barcode'];
    $sample['ContainerTypeID']   = $containerTypeID;
    $sample['Temperature']       = $container['Temperature'];

    $DB->insert('biobank_container', $sample);
    $containerID = $DB->getLastInsertId();

    //parent container
    if ($parent !== null) {
        $DB->insert(
            'biobank_container_parent',
            array(
             'ContainerID'       => $containerID,
             'ParentContainerID' => $parent,
             'Coordinate'        => $container['location'],
            )
        );
    }

    //associate with project
    insertContainerProjectRel($containerID, $projectID);

	return $containerID;
}

/**
 * Insert the specimen and related table information
 * - freeze thaw cycle
 * - preparation
 * - collection
 *
 * @param array $tmRow       row of data for Oracle DB
 * @param int   $containerID the container in which the speciment is located
 * @param int   $candID      the candidate ID
 * @param int   $sessionID   the session at which the specimen was collected
 * @param int   $centerID    the ID of the center where the sample where collected
 *
 * @return int the specimenID
 */
function insertSpecimen(
    array $tmRow,
    int $containerID,
    $candID,
    $sessionID,
    $centerID
) : int {
    $DB =& \Database::singleton();

    $specimen = array();
    $specimen['ContainerID'] = $containerID;
//    $specimen['CandidateID'] = $candID;    removed from table schema
    $specimen['SessionID']   = $sessionID;

    $sql = 'SELECT SpecimenTypeID
         FROM biobank_specimen_type
         WHERE Label = :label';
    $specimen['SpecimenTypeID'] = $DB->pselectOne(
        $sql,
        array('label' => $tmRow['SAMPLE_TYPE'])
    );
    if ($specimen['SpecimenTypeID'] === null) {
        throw new LorisException("invalid specimen type {$tmRow['SAMPLE_TYPE']}"); //TODO to refine
    }

    //exception for null unit
    if (is_null($tmRow['QTY_UNITS']) && $tmRow['SAMPLE_TYPE'] == 'DNA') {
        $tmRow['QTY_UNITS'] = "µL";
        echo "Qty_Units null, DNA, assuming µL\n";
    }
    elseif (is_null($tmRow['QTY_UNITS']) && $tmRow['SAMPLE_TYPE'] == 'Trizol lysate') {
        $tmRow['QTY_UNITS'] = "10⁶/mL";
        echo "Qty_Units null, Trizol lysate, assuming 10⁶/mL\n";
    }

    $specimen['Quantity'] = $tmRow['QTY_ON_HAND'];
    $specimen['UnitID']   = getUnitID($tmRow['QTY_UNITS']);

    $DB->insert('biobank_specimen', $specimen);
    $specimenID = $DB->getLastInsertID();

    // freezethaw
    if (is_int($tmRow['FT_CYCLES']) && $tmRow['FT_CYCLES'] != 0) {
        $DB->insert(
            'biobank_specimen_freezethaw',
            array(
             'SpecimenID'      => $specimenID,
             'FreezeThawCycle' => $tmRow['FT_CYCLES'],
            )
        );
    }

    // insert preparation
    $specimenPrep = array();
    $specimenPrep['SpecimenID'] = $specimenID;
    $specimenPrep['SpecimenProtocolID'] = getProtocolID("Preparation", $tmRow['SAMPLE_CATEGORY']);

    if (is_null($tmRow['PREP_DATE'])) {
        echo "Prep_Date null, assuming Event_Date\n";
        $tmRow['PREP_DATE'] = $tmRow['EVENT_DATE'];
    }

    $specimenPrep['CenterID'] = $centerID;
    $specimenPrep['Date']     = $tmRow['PREP_DATE'];
    $specimenPrep['Time']     = '00:00:00';
    $specimenPrep['ExaminerID'] = extractExaminer($tmRow['PREP_BY'], 2);

    $DB->insert('biobank_specimen_preparation', $specimenPrep);
    $specimenPrepJson['Data'] = getJson($tmRow, 'preparation');
    if ($specimenPrepJson['Data'] != '[]') {
        $DB->unsafeUpdate(
            'biobank_specimen_preparation',
            $specimenPrepJson,
            array('SpecimenID' => $specimenID)
        );
    }

    // insert specimen_collection

    // exception
    if (is_null($tmRow['COLLECTION_DATE'])) {
        echo "Coll_Date null, assuming Event_Date\n";
        $tmRow['COLLECTION_DATE'] = $tmRow['EVENT_DATE'];
    }

    $specimenColl = array();
    $specimenColl['SpecimenID'] = $specimenID;
    $specimenColl['SpecimenProtocolID'] = getProtocolID("Collection", $tmRow['SAMPLE_CATEGORY']);
    $specimenColl['Quantity']   = $tmRow['QTY_ON_HAND'];
    $specimenColl['UnitID']     = getUnitID($tmRow['QTY_UNITS']);
    $specimenColl['CenterID']   = $centerID;
    $specimenColl['Date']       = $tmRow['COLLECTION_DATE'];
    $specimenColl['Time']       = '00:00:00';
	$specimenColl['ExaminerID'] = extractExaminer($tmRow['PREP_BY'], 1);
    $DB->insert('biobank_specimen_collection', $specimenColl);

    $specimenCollJson['Data']   = getJson($tmRow, 'collection');
    if ($specimenCollJson['Data'] != '[]') {
        $DB->unsafeUpdate(
            'biobank_specimen_collection',
            $specimenCollJson,
            array('SpecimenID' => $specimenID)
        );
    }
    return $specimenID;
}

/**
 * Get the ID of the mesurement unit in LorisDB
 *
 * @param string $tmUnit the unit label in TM database
 *
 * @return int the UnitID
 */
function getUnitID(string $tmUnit) : int
{
    $DB =& \Database::singleton();

    $sql  = "SELECT UnitID FROM biobank_unit WHERE Label = :label";
    $unit = $DB->pselectOne($sql, array('label' => $tmUnit));
    if ($unit === false) {
        throw new LorisException('TM quantity unit not found');
    }
    return $unit;
}

/**
 * Create the json string with attributes for a category
 * ues global arrays for list of attributes to check and ID
 *
 * @param array  $tmRow    row of data for Oracle DB
 * @param string $category for which part of the sample json id being build
 *                         preparation, collection
 *
 * @return $string json encoded values
 */
function getJson(array $tmRow, string $category) : string
{

    global $jsonAttributes;
    global $jsonIDs;
    $json = array();
    foreach ($jsonAttributes[$category] as $key => $label) {
        if (isset($tmRow[$key]) && !empty(trim($tmRow[$key]))) {
            $id = $jsonIDs[$label];
            if (!empty($id)) {
                $json[$id] = trim($tmRow[$key]);
            }
        }
    }
    return json_encode($json); //check format with Henry
}

/**
 * Get the ID to use in JSON attributes and populates global arrays
 *
 * @param array $jsonAttributes the array with different attributes we need
 *                              the IDs from the Loris DB
 *
 * @return array a hash with the ID for each attributes
 */
function getJsonID(array $jsonAttributes) : array
{
    $listOfAttributes = array();
    foreach ($jsonAttributes as $key => $val) {
        foreach ($val as $attribute) {
            $listOfAttributes[] = $attribute;
        }
    }
    $listOfAttributes = array_unique($listOfAttributes);

    $jsonID = array();
    $DB     =& \Database::singleton();

    foreach ($listOfAttributes as $label) {
       $sql = "SELECT SpecimenAttributeID 
            FROM biobank_specimen_attribute
            WHERE Label = :label";
        $jsonID[$label] = $DB->pselectOne($sql, array('label' => $label));
    }

    return $jsonID;
}

/**
 * Create a new subproject with only the name
 *
 * @param string $subprojectName the name of the subproject
 *
 * @return int the subprojectID
 */
function insertSubproject(string $subprojectName) : int
{
    $DB =& \Database::singleton();

    $subproject['title'] = $subprojectName;
    $DB->insert('subproject', $subproject);
    return $DB->getLastInsertId();
}

/**
 * Create a new center in the psc table
 *
 * @param array $centerName an array containing
 *                          - the name
 *                          - alias
 *                          - MRI_alias
 *
 * @return int the subprojectID
 */
function insertCenter(array $centerName) : int
{
    $DB =& \Database::singleton();

    $DB->insert('psc', $centerName);
    return $DB->getLastInsertId();
}

/**
 * Get the containerStatusID from biobank_container_status
 *
 * @param string the status from TM
 *
 * @return int the containerStatusID
 */

function getContainerStatus($statusID) : int
{
    $DB =& \Database::singleton();
    $sql = 'SELECT ContainerStatusID
           FROM biobank_container_status
           WHERE Label = :label';
    $containerStatusID = $DB->pselectOne(
        $sql,
        array(
         'label' => $statusID,
         )
    );
    return $containerStatusID;
}

/**
 * add the new protocol from TM in the biobank_specimen_protocol table
 *
 * @param string $newProtocol the name of the protocol
 *
 * @return int the subprojectID
 */

function addNewProtocol($newProtocol){
    $DB =& \Database::singleton();
    $DB->insert(
        'biobank_specimen_protocol',
        array(
         'Label' => $newProtocol,
        )
    );
    return $DB->getLastInsertId();
}

/**
 * modify the value of a few parametes in preparation for the JSON table
 *
 * @param array pointer $tmRow  The row from Oracle
 *
 * @return void
 */
function adjustAttribute(&$tmRow) : void
{
    // Hemol Index
    if (substr($tmRow['DISEASE_CODE'], 0 ,1) == 'H'){
       $value = substr($tmRow['DISEASE_CODE'], 1 ,1);
        // case where 'H' only, return 0
       $tmRow['DISEASE_CODE'] =  is_numeric($value) ? $value : '0';
    }

    //quality
    if (stripos($tmRow['SITE_OF_TISSUE'], "milky")){
        $tmRow['SITE_OF_TISSUE'] = "1";
    } else {
        $tmRow['SITE_OF_TISSUE'] = null;
    }
        
}

function getProjectID($project) : string
{
    $DB   =& \Database::singleton();
    $sql  = "SELECT ProjectID FROM Project WHERE Name = :name";
    return $DB->pselectOne($sql, array('name' => $project));
}

function insertContainerProjectRel($containerID, $projectID) : void
{
    $DB   =& \Database::singleton();
    $DB->insert(
        'biobank_container_project_rel',
        array(
         'ContainerID' => $containerID,
         'ProjectID' => $projectID,
        )
    );
}

function getProtocolID($process, $label)
{
    $DB   =& \Database::singleton();
    $sql = 'SELECT SpecimenProtocolID
        FROM biobank_specimen_protocol
        WHERE Label like :label and SpecimenProcessID = :process';
    $protocolID = $DB->pselectOne(
        $sql,
        array(
         'label'   => '%'.$label.'%',
		 'process' => getProcessID($process)
         )
    );
    if (!$protocolID) {
        throw new LorisException("specimen_protocol inexistant: $process, $label"); 
    }

    return $protocolID;
}

function getProcessID($process)
{
    $DB   =& \Database::singleton();
    $sql = 'SELECT SpecimenProcessID
        FROM biobank_specimen_process
        WHERE Label like :label';
    return $DB->pselectOne(
        $sql,
        array(
         'label' => $process
         )
    );
}

function extractExaminer($name, $step)
{
    // TM initial, LORIS UserID
    $refTable = array('MNB' => 'Marie-Noëlle Boivin',
                      'SL'  => 'Sonia Lai',
                      'MT'  => 'Mahdieh Tabatabaei Shafiei',
                      'JS'  => 'Julien Sirois',
                      'AV'  => 'Ada Villalobos'
                     );

    $tmUsersList = explode(',', $name);

    if ($step == 1) {
        $tmUser = $tmUsersList[0];
    } elseif ($step == 2 && !empty($tmUsersList[1])) {
        $tmUser = $tmUsersList[1];
    } else {
        $tmUser = $tmUsersList[0];
    }

    if (array_key_exists($tmUser, $refTable)) {
        $examinerName = $refTable[$tmUser];
    } else {
        $examinerName = 'Admin account';
    }

    return getExaminerID($examinerName);
}

    function getExaminerID($examinerName)
{
    $DB   =& \Database::singleton();
    $sql = 'SELECT examinerID
        FROM examiners
        WHERE full_name = :name';
    return $DB->pselectOne(
        $sql,
        array(
         'name' => $examinerName
         )
    );
}
