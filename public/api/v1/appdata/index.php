<?php
/**
 * Created by PhpStorm.
 * User: mkahn
 * Date: 1/5/16
 * Time: 3:14 PM
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require('../shared/shared.php');


$entityBody = file_get_contents('php://input');

if (isPOST() || isPUT()) {

    if (isset($_REQUEST['appid'])) {

        $appData = loadJSON('appdata', array());
        $appData[$_REQUEST['appid']] = array(
            "data" => json_decode($entityBody),
            "lastUpdated" => getMSTime()
        );
        saveJSON('appdata', $appData);
        echo $entityBody;

    } else {
        badReq('missing appid');
    }


} elseif (isDELETE()) {

    if (isset($_REQUEST['appid'])) {
        $appData = loadJSON('appdata', array());
        if (array_key_exists($_REQUEST['appid'], $appData)) {
            unset( $appData[$_REQUEST['appid']] );
            saveJSON('appdata', $appData);
            echo 'ok';
        } else {
            badReq('No data for that app');;
        }

    } else {
        badReq('missing appid');
    }


} else {

    if (isset($_REQUEST['appid'])) {
        $appData = loadJSON('appdata', array());
        if (array_key_exists($_REQUEST['appid'], $appData)) {
            $rval = $appData[$_REQUEST['appid']];
            echo json_encode($rval);
        } else {
            echo json_encode(array());
        }

    } else {
        badReq('missing appid');
    }

}