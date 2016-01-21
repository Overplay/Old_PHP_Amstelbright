<?php
/**
 * Created by PhpStorm.
 * User: mkahn
 * Date: 1/5/16
 * Time: 11:55 AM
 */

function isPOST()
{
    return ($_SERVER['REQUEST_METHOD'] === 'POST');
}

function isGET()
{
    return ($_SERVER['REQUEST_METHOD'] === 'GET');
}

function isPUT()
{
    return ($_SERVER['REQUEST_METHOD'] === 'PUT');
}

function isDELETE()
{
    return ($_SERVER['REQUEST_METHOD'] === 'DELETE');
}

function reqMethod()
{
    return $_SERVER['REQUEST_METHOD'];
}

function badReq($msg)
{
    http_response_code(400);
    echo $msg;
}

function jsonOut($json)
{
    header('Content-Type: application/json');
    echo $json;
}


function getMSTime()
{
    return $mstime = time(); // . '000'; //dirty hack for scientific notation
}

/**
 * @param $objName name to save under
 * @param $assocArray PHP assoc array to save
 */
function saveJSON($objName, $assocArray)
{
    //Encode the array into a JSON string.
    $encodedString = json_encode($assocArray);
    //Save the JSON string to a text file.
    file_put_contents('../data/' . $objName . '.json', $encodedString);
}

/**
 * @param $objName to save under
 * @return PHP Array
 */
function loadJSON($objName, $default)
{

    $fpath = '../data/' . $objName . '.json';

    if (!file_exists($fpath)) {
        saveJSON($objName, $default);
        return $default;
    }

    //Retrieve the data from our text file.
    $fileContents = file_get_contents($fpath);
    //Convert the JSON string back into an array.
    $decoded = json_decode($fileContents, true);
    if ($decoded == null) {
        $decoded = $default;
    }
    return $decoded;
}

function rmJSON($path){

    $fpath = '../data/' . $path . '.json';

    if (!file_exists($fpath)) {
        return unlink($fpath);
    }

    return false;

}