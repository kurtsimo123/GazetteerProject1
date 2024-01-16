<?php

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$url='https://openexchangerates.org/api/latest.json?app_id=a981918cd5cf4c058b6f531705ccff26';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/json; charset=UTF-8');

echo $response;
?>
