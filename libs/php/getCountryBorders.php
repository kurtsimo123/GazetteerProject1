<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$countryData = file_get_contents('./countryBorders.geo.json');

$jsonData = json_decode($countryData, true);
$iso_a2 = $_REQUEST['iso_a2'];

$geometry = null;
for ($i = 0; $i < count($jsonData['features']); $i++) {
    $feature = $jsonData['features'][$i];
    $properties = $feature['properties'];
    if($properties['iso_a2']=== $iso_a2) {
        $geometry = $feature['geometry'];
        break;
    }
}
if ($geometry !==null) {
    header('Content-Type: application/json');
    echo json_encode($geometry);
}

?>
