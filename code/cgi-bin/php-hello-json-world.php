<?php

// Set Content-Type header so that browser understands it receives a JSON
header("Content-Type: application/json");

// Create array of key-value pairs for JSON
$jsonArray = array(
	"IP" => $_SERVER['REMOTE_ADDR'],
	"heading" => "Hello, PHP!",
	"message" => "This response was generated with the PHP programming language",
	"time" => date(DATE_RFC2822),
	"title" => "Hello, PHP!");

//  Print JSON encoding of this array
echo json_encode($jsonArray);
?>