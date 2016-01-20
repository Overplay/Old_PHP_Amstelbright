<?php
/**
 * Created by PhpStorm.
 * User: mkahn
 * Date: 1/5/16
 * Time: 3:14 PM
 */

//Uncomment these lines of code to echo PHP errors during debug.

//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

require('../shared/shared.php');

function dpathFor($appId){
    return 'appdata/' . $appId;
}

//Get the JSON body
$entityBody = file_get_contents('php://input');

if (isPOST() || isPUT()) {

    if (isset($_REQUEST['appid'])) {

        $appId = $_REQUEST['appid'];

        $dataToSave = array(
            "payload" => json_decode($entityBody),
            "lastUpdated" => getMSTime()
        );

        saveJSON( dpathFor( $appId ), $dataToSave);
        jsonOut($entityBody);

    } else {
        badReq('missing appid');
    }


} elseif (isDELETE()) {

    if (isset($_REQUEST['appid'])) {

        $rmRes = rmJSON(dpathFor($_REQUEST['appid']));

        if ($rmRes) {
            echo 'deleted';
        } else {
            badReq('No data for that app');
        }
    } else {
        badReq('missing appid');
    }


} else {

    if (isset($_REQUEST['appid'])) {

        //If the file does not exist, we will get FALSE as the $rval
        $rval = loadJSON( dpathFor($_REQUEST['appid'] ), false);

        if ($rval) {

            if (count($rval['payload']) == 0) {
                //empty object which PHP will incorrectly send down ad an array
                echo jsonOut(json_encode($rval, JSON_FORCE_OBJECT));
            } else {
                echo jsonOut(json_encode($rval));
            }

        } else {

            //Of course the below does not work in PHP 5.2!
            //http_response_code(404);

            //THIS fucking hack should work on Chumbster
            $sapi_type = php_sapi_name();
            if (substr($sapi_type, 0, 3) == 'cgi')
                header("Status: 404 Not Found");
            else
                header("HTTP/1.1 404 Not Found");

            echo json_encode(array('error' => 'no data for that app'), JSON_FORCE_OBJECT);

        }

    } else {
        badReq('missing appid');
    }

}