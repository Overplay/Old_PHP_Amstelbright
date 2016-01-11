<?php
/**
 * OVERPLAY OS ENDPOINT
 * Port of NodeJS version
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require('../shared/shared.php');
require('../shared/messaging.php');


if (isset($_REQUEST['command'])) {

    $cmd = $_REQUEST['command'];
    switch ($cmd) {

        case 'jsave':
            //Save JSON
            $arr = array("beer" => "cold", "hamburger" => "vtasty");
            saveJSON("test", $arr);
            break;

        case 'nest':
            //Save JSON
            $arr = array("nest" => array(), "hamburger" => "tasty");
            array_push($arr["nest"], array("chicken" => "white", "beef" => "red"));
            saveJSON("nest", $arr);
            echo var_dump($arr);
            break;

        case 'msg':
            //Save JSON
            postAppMessage('io.overplay.mainframe', 'io.overplay.test', array("msg"=>'payload'));
            echo 'ok';
            break;

        case 'msg2':
            //Save JSON
            postAppMessage('io.overplay.mainframe', 'io.overplay.testa', array("msg" => 'payload'));
            echo 'ok';
            break;

        case 'poptest':

            $msg = popAppMessage('io.overplay.testa');
            echo json_encode($msg);
            break;

        case 'null':

            $ar = array();
            array_push($ar, null);
            array_push($ar, "alpha");
            array_push($ar, null);
            array_push($ar, "beta");
            jsonOut(json_encode($ar));

    }


} else {
    badReq('no test parameter');
}


