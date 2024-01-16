<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$countryData = file_get_contents('./countryBorders.geo.json');

$jsonData = json_decode($countryData, true);

$countriesArray =[];

foreach($jsonData['features'] as $feature)  {
  $name = $feature['properties']['name'];
  $iso_a2 = $feature['properties']['iso_a2'];
  array_push($countriesArray, $feature['properties']);
}

usort($countriesArray, function($a, $b) {
  return strcmp($a['name'], $b['name']);
});
echo json_encode($countriesArray);
?>
