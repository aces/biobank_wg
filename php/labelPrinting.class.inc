<?php

/**
*This class is for printing the biobank labels
*
* @category   Page
* @package    Loris
* @subpackage Biobank
* @author     Henri Rabalais <henri.rabalais@mcin.ca>
* @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
* @link       http://www.github.com/aces/Loris/
**/

$zpl = "^XA,,^FO20,20^BY2,^BCN,100,Y,Y,N,^FD001645000032^FS,^FO20,130,^FDSerum,^XZ";



$curl = curl_init();
// adjust print density (8dpmm), label width (4 inches), label height (6 inches), an$
curl_setopt($curl, CURLOPT_URL, "http://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/");
curl_setopt($curl, CURLOPT_POST, TRUE);
curl_setopt($curl, CURLOPT_POSTFIELDS, $zpl);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
$result = curl_exec($curl);

if (curl_getinfo($curl, CURLINFO_HTTP_CODE) == 200) {
    $file = fopen("label.png", "w"); // change file name for PNG images
    fwrite($file, $result);
    fclose($file);
} else {
    print_r("Error: $result");
}

curl_close($curl);

exec("lp -U amni22 -d mcgill_mono -0 label.png");

?>

