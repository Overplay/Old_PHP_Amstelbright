<?php
/**
 * OVERPLAY OS ENDPOINT
 * Port of NodeJS version
 */

require('../shared/shared.php');
require('../shared/messaging.php');
require('../shared/apps.php');


/******************************************************/

if (isset($_REQUEST['command'])) {

    $cmd = $_REQUEST['command'];
    switch ($cmd) {

        case "ostime":
            if (isGET()) {
                $mstime = time() . '000'; //dirty hack for scientific notation
                $jsdate = date('D M d Y H:i:s O');
                $rval = array("date" => $jsdate, "msdate" => $mstime);
                echo json_encode($rval);
            } else {
                badReq('GET only');
            }
            break;

        //Think this is not used anyway
        case 'ipaddress':
            if (isGET()) {
                $rval = array("ip" => $_SERVER['SERVER_ADDR']);
                echo json_encode($rval);
            } else {
                badReq('GET only');
            }
            break;

        case 'screenmap':
            header('Content-Type: application/json');
            echo json_encode(screenMap());

            break;

        case 'running':
            header('Content-Type: application/json');
            echo json_encode(runningApps());
            break;

        case 'kill':

            if (isPOST() && isset($_REQUEST['appid'])) {

                $kill = killApp($_REQUEST['appid']);

                if ($kill["success"]) {
                    jsonOut(json_encode(array("killed" => $_REQUEST['appid'])));
                } else {
                    badReq($kill["msg"]);
                }
            } else {
                badReq('Wrong verb or no appid');
            }

            break;


        case 'launch':

            if (isPOST() && isset($_REQUEST['appid'])) {

                signalAppLaunch($_REQUEST['appid']);

                $launch = runApp($_REQUEST['appid']);

                if ($launch["success"] )
                {
                    jsonOut(json_encode(array("launch" => $_REQUEST['appid'])));
                }
                else {
                    badReq($launch["msg"]);
                }
            } else {
                badReq('Wrong verb or no appid');
            }

            break;

        case 'move':


            if ( isPOST() && isset($_REQUEST['appid']))
            {
                $res = moveApp($_REQUEST['appid']);
                header('Content-Type: application/json');
                echo json_encode($res);
            } else
            {
                badReq('Wrong verb or no appid');
            }

            break;


        case 'appsbystate':

            header('Content-Type: application/json');
            echo json_encode(appsByState());

            break;


    }


} else {

    badReq('no command parameter');

}

