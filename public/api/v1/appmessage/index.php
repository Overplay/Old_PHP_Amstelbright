<?php
/**
 * Created by PhpStorm.
 * User: mkahn
 * Date: 1/5/16
 * Time: 5:25 PM
 *
 * APPMESSAGE API MK
 *
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require('../shared/shared.php');
require('../shared/messaging.php');


/*  MAIN ENTRY */

$entityBody = file_get_contents('php://input');

if (isPOST() || isPUT()) {

        //TODO reject if the format is wrong (no dest, etc.)cd
        $msg = json_decode($entityBody, true);
        $dest = $msg['dest'];
        $src = $msg['src'];
        $data = $msg['messageData'];

        postAppMessage($src, $dest, $data);
        echo $entityBody;


} elseif (isDELETE()) {

    if (isset($_REQUEST['appid'])) {


            badReq('Delete not supported, dude.');;

    } else {
        badReq('missing appid');
    }


} else {

    if (isset($_REQUEST['appid'])) {

        $msg = popAppMessage($_REQUEST['appid']);
        echo json_encode($msg);;

    } else {
        badReq('missing appid');
    }

}