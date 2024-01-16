<?php

	

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$url='https://date.nager.at/api/v3/publicholidays/2023/' . $_REQUEST['countryCode'];
$executionStartTime = microtime(true);


$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
