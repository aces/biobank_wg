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
        insertSample($tmRow);
    }

    



}

function insertCandidate(array $tmRow, array &$candidate) : bool
{
    $candidate['active'] = 'Y'; 
    $candidate['CenterID'] = ''; 
    $candidate['Testdate'] = ''; // from TM
    $candidate['Entity_type'] = 'Human';

}

function insertSession(array $tmRow, $candID, $userID) : bool
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
    $session['SubprojectID'] from TM;
    $session['Submitted'] = 'N';
    $session['Current_stage'] = 'visit';
    $session['Data_stage_change']   date of import in Loris
    $session['Date_active']  date of Visit in TM
    $session['RegisteredBy']   if in TM if not $userID
    $session['date_registered']  date of import in Loris
    $session['scan_done'] = 'N';

    

    insert("session", $session);
    return getLastInsertID();
}

function insertSample(array $tmRow) : bool
{
    $sample = array();

    // insert container (with parents)
    $tmLocation = $tmRow['STORAGE_ADDRESS'];
    $locationSplit = explode('-',$tmLocation);
    switch (substring($locationSplit[1], )) {
        case 'FRZ':
        case 'CRY':
    


    }
    // insert preparation
    // insert specimen_collection
    // insert 
}

function updateSample(array $tmRow) : bool
{

}
