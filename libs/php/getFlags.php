<?php


$url='https://restcountries.com/v3.1/alpha/' . $_REQUEST['countryCode'];


ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);


$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
