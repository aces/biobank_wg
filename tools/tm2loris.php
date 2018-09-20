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
 * @author   Various <melanie.legault2@mcgill.ca>
 * @license  Loris license
 * @link     https://www.github.com/aces/biobank_wg/
 */

include __DIR__ ."/cred.inc";  //Oracle DB credential
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
$userPWD    = readline_terminal("\nPlease enter your LORIS password");
$auth       = new SinglePointLogin;

if(!$auth->passwordAuthenticate($userID, $userPWD, false)) {
    echo "\nInvalid userID, password combination\n";
    exit(1);
}


// connect to the Oracle DB
global $orConn;

$orConn = oci_connect( $user, $passwd, $service);
if (!$orConn) {
    $e = oci_error();
    print "Error!: " . $e->getMessage();
    exit(2);
}

$stid = oci_parse($orConn, 'ALTER SESSION SET CURRENT_SCHEMA = SYSTMETRIX'); //TODO put schema in config file
if (!oci_execute($stid)) {
    $e = oci_error();
    print "Error!: " . $e->getMessage();
    exit(2);
}   

function readline_terminal($prompt = '') {
    $prompt && print $prompt;
    $terminal_device = '/dev/tty';
    $h = fopen($terminal_device, 'r');
    if ($h === false) {
        #throw new RuntimeException("Failed to open terminal device $terminal_device");
        return false; # probably not running in a terminal.
    }
    `/bin/stty -echo`;
    $line = rtrim(fgets($h),"\r\n");
    `/bin/stty echo`;
    fclose($h);
    return $line;
}

function showHelp()
{
    echo "***Import samples data from Tissus Metrix***\n\n";
    echo "Usage: php tm2loris.php userID [confirm]\n\n";
    echo "If confirm is used, the data will be pushed to the LORIS database.\n";
    echo "If not, a count of how many samples, candidate, and session\n";
    echo "information to be added or updated will be shown.\n";

    exit(1);
}

$orQuery = "SELECT S.SAMPLE_NUMBER, SAMPLE_TYPE, S.DISEASE_CODE, FT_CYCLES,
    PREP_DATE, STORAGE_STATUS, INSTITUTION, COLLECTED_BY, QTY_UNITS,
    SITE_OF_TISSUE, STORAGE_ADDRESS, QTY_ON_HAND, SAMPLE_CATEGORY, 
    COLLECTION_DATE, SITE_CODE, S.COMMENTS, D.SEX, FILE1, DATE_OF_BIRTH,
    s.DONOR_ID, s.EVENT_ID, e.EVENT_NAME, e.EVENT_DATE
FROM TM_SAMPLES S 
LEFT JOIN TM_DONORS D ON S.DONOR_ID = D.DONOR_ID 
LEFT JOIN TM_DONOR_EVENTS e ON s.EVENT_ID = e.EVENT_ID";

$stid = oci_parse($orConn, $orQuery);
oci_execute($stid);
while (($tmRow = oci_fetch_assoc($stid)) != false) {
    $candidate = array();

    // check if sample already exist in Loris
    $sampleExist = $DB->pselectOne(
        "SELECT COUNT(ContainerID)
         FROM biobank_container
         WHERE Barcode = :barcode",
        array(':barcode'  => $tmRow['SAMPLE_NUMBER'])
    );
    if ($sampleExist != 0) {
        updateSample($tmRow);
    } else {
        // check if candidate exist
        $candidate['PSCID'] = $tmRow['FILE1'] ?? "TMID_".$tmRow['DONOR_ID'];
        $candidate['CandID'] = $DB->pselectOne(
            "SELECT CandID
             FROM candidate
             WHERE PSCID = :pscid",
            array(':pscid' => $candidate['PSCID'])
        );
        if (!$candidate['CandID']) {
            $candidate['CandID'] = insertCandidate($tmRow, $candidate);
        }
        // check if session exist
        $session['Visit_label'] = $tmRow['EVENT_NAME'];
        $session['ID'] = $DB->pselectOne(
            "SELECT ID
             FROM session
             WHERE CandID = :candID AND Visit_label = :visit",
            array(':candID' => $candidate['PSCID'])
        );
        if (!$session['ID']) {
            $session['ID'] = insertSession($tmRow, $candidate['CandID'], $userID);
        }
        insertSample($DB, $tmRow);
    }

    



}

function insertCandidate(array $tmRow, array &$candidate) : bool
{
    $candidate['active'] = 'Y'; 
    $candidate['CenterID'] = ''; 
    $candidate['Testdate'] = ''; // from TM
    $candidate['Entity_type'] = 'Human';

}

function insertSession($DB, $tmRow, $candID, $userID) : bool
{
    $session = array();
    $session['CandID'] = $candID; 
    $session['CenterID'] = ""; // need to set to specific
    $session['Active'] = 'Y'; 
    $session['UserID'] = $userID;
    $session['Hardcopy-request'] = '-';
    $session['MRIQCStatus'] = '';
    $session['MRIQCPending'] = 'N';
    $session['MRICaveat'] = 'false';
    $session['Visit_label'] = $tmRow['EVENT_NAME']; 
    $session['SubprojectID']= ''; //TODO from TM;
    $session['Submitted'] = 'N';
    $session['Current_stage'] = 'visit';
    $session['Data_stage_change'] = ""; //TODO  date of import in Loris
    $session['Date_active'] = ''; //TODO  date of Visit in TM
    $session['RegisteredBy'] = ''; //TODO  if in TM if not $userID
    $session['date_registered'] = ''; //TODO date of import in Loris
    $session['scan_done'] = 'N';

    

    $DB->insert("session", $session);
    return getLastInsertID();
}

function insertSample($DB, array $tmRow) : bool
{
     //find pscID and other info
    $sql = 'SELECT CenterID FROM psc WHERE Name = :name';
    $pscID = $DB->pselectOne($sql, array('name' => '')); //TODO fill in center name   

    $sql = 'SELECT ContainerStatutID FROM biobank_container_status WHERE Label = "Available"'; 
    $containerStatusID = $DB->pselectOne($sql, array());

    $sample = array();
    $sample['Temperature'] = //TODO check with Sonia
    $sample['ContainerStatusID'] = $containerStatusID;
    $sample['OriginCenter'] =  $pscID; 
    $sample['CurrentCenter'] = $pscID;
    $sample['DateTimeCreate'] = $tmRow['COLLECTION_DATE'];

    // insert container (with parents)
    $tmLocation = array();
    $locationSplit = explode('-',$tmRow['STORAGE_ADDRESS']);
    switch (substring($locationSplit[1], 0, 3)) {
        case 'FRZ':
            if ((int)substr($locationSplit[1], 3) < 9) {
               $tmLocation[0]['descriptor'] = '5 Shelf';
               $tmLocation[1]['descriptor'] = '6 Rack';
               $tmLocation[2]['descriptor'] = '16 Box';
               $tmLocation[3]['descriptor'] = '10x10';
               $tmLocation[4]['descriptor'] = 'Cryotube';
            } else {
               $tmLocation[0]['descriptor'] = '3 Shelf';
               $tmLocation[1]['descriptor'] = '7 Rack';
               $tmLocation[2]['descriptor'] = '28 Box';
               $tmLocation[3]['descriptor'] = '10x10';
               $tmLocation[4]['descriptor'] = 'Cryotube';
            }
            $tmLocation[0]['type'] = 'Freezer';
            $tmLocation[0]['barcode'] = $locationSplit[1];
            $tmLocation[0]['location'] = substr($locationSplit[1], 3);
            $tmLocation[1]['type'] = 'Shelf';
            $tmLocation[1]['barcode'] = $tmLocation[0]['value'].'-'.substr($locationSplit[2], 1);
            $tmLocation[1]['location'] = substr($locationSplit[2], 1);
            $tmLocation[2]['type'] = 'Rack';
            $tmLocation[2]['barcode'] = $tmLocation[1]['value'].'-'.substr($locationSplit[3], 1);
            $tmLocation[2]['location'] = substr($locationSplit[3], 1);
            $tmLocation[3]['type'] = 'Matrix Box';
            $tmLocation[3]['barcode'] = $tmLocation[2]['value'].'-'.substr($locationSplit[4], 1);
            $tmLocation[3]['location'] = substr($locationSplit[4], 1);
            $tmLocation[4]['type'] = 'Tube'; 
            $tmLocation[4]['barcode'] = $tmRow['STORAGE_ADDRESS'];
            $tmLocation[4]['location'] = $locationSplit[5];
            break;
        case 'CRY':

            $tmLocation[0]['descriptor'] = '14 rack tank';
            $tmLocation[0]['type'] = 'CryoTank';
            $tmLocation[0]['barcode'] = $locationSplit[0].'-'.$locationSplit[1];
            $tmLocation[0]['location'] = $locationSplit[2];
            $tmLocation[1]['descriptor'] = '13 box';
            $tmLocation[1]['type'] = 'Rack';
            $tmLocation[1]['barcode'] = $tmLocation[0]['value'].'-'.substr($locationSplit[3], 1);
            $tmLocation[0]['location'] = substr($locationSplit[3], 1);
            $tmLocation[2]['descriptor'] = '10x10';
            $tmLocation[2]['type'] = 'Matrix Box';
            $tmLocation[2]['barcode'] = $tmLocation[1]['value'].'-'.substr($locationSplit[4], 1);
            $tmLocation[0]['location'] = substr($locationSplit[4], 1);
            $tmLocation[3]['descriptor'] = 'Cryotube';
            $tmLocation[3]['type'] = 'Tube'; 
            $tmLocation[3]['barcode'] = $tmRow['STORAGE_ADDRESS'];
            $tmLocation[0]['location'] = $locationSplit[5];
            break;
        case 'VIR':
            $storageType = 'VIRTUAL';
            break;
        default:
    }
    

        $containerID = insertContainer($DB, $tmLocation[0], $sample, null, false);
        $size = count($tmLocation);
        for ($i = 1; $i < $size - 1; $i++) {
            $containerID = insertContainer($DB, $tmLocation[$i], $sample, $containerID, false);  
        }
        $containerID = insertContainer($DB, $tmLocation[$i], $sample, $containerID, true); 

    // insert preparation
    // insert specimen_collection
    // insert 
}

function updateSample(array $tmRow) : bool
{

}

function insertContainer($container, $sample, $parent = null, $exclusif = true) : int
{
    //check if already exist
    $sql = "SELECT ContainerID FROM biobank_container WHERE Barcode := barcode";
    $exist = $DB->pselectOne($sql, array('barcode' => $container['barcode']));
    if ($exist !== null) {
        if ($exclusif === true) {
            throw new LorisException('Barcode already taken');
        } else {
            return $exist;
        }
    }
    //not existant, add

    $sql = 'SELECT ContainerTypeID FROM biobank_container_type WHERE Type := type and Descriptor := Descriptor';
    $containerTypeID = pselectOne($sql, array('Type' => $container['type'], 'Descriptor' => $container['descriptor']));

    $sample['Barcode'] = $container['barcode'];
    $sample['ContainerTypeID'] = $containerTypeID;
    $DB->insert('biobank_container', $sample);
    $containerID = $DB->getLastInsertId();

    //parent container
    if ($parent !== null) {
        $DB->insert('biobank_container_parent', array($ContainerID, $parent, $sample['location']));
    }
}
