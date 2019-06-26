
<?php

$zpl = "^XA,^FO20,20^BY2,^BCN,100,Y,Y,N,^FD001645000032^FS,^FO20,130,^FDSerum,^XZ";



$curl = curl_init();
// adjust print density (8dpmm), label width (4 inches), label height (6 inches), and label index (0) as necessary
curl_setopt($curl, CURLOPT_URL, "http://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/");
curl_setopt($curl, CURLOPT_POST, TRUE);
curl_setopt($curl, CURLOPT_POSTFIELDS, $zpl);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($curl, CURLOPT_HTTPHEADER, array("Accept: application/pdf")); // omit this line to get PNG images back
$result = curl_exec($curl);

if (curl_getinfo($curl, CURLINFO_HTTP_CODE) == 200) {
    $file = fopen("label.pdf", "w"); // change file name for PNG images
    fwrite($file, $result);
    fclose($file);
} else {
    print_r("Error: $result");
}

curl_close($curl);

?>

