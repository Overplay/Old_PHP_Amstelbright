<?php
/**
 * OVERPLAY OS ENDPOINT
 * Port of NodeJS version
 */

require('../shared/shared.php');
require('../shared/messaging.php');
require('../shared/apps.php');

function signalAppLaunch($app) {

    //Not sure we really need to signal to mainframe that an app launch happened, a "layout" message should be enough
    postAppMessage('io.overplay.overplayos','io.overplay.mainframe', array('launch'=>$app));
    signalLayoutChange();

}

function signalLayoutChange()
{
    postAppMessage('io.overplay.overplayos', 'io.overplay.mainframe', array("layout"=>true));
}

/******************************************************/

function moveApp($appid){

    $runningApps = loadJSON('runningApps', array());
    return 3;
}


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
            break;

        case 'running':
            break;

        case 'launch':

            if (isPOST() && isset($_REQUEST['appid'])) {

                if (runApp($_REQUEST['appid']) )
                {
                    signalAppLaunch($_REQUEST['appid']);
                    jsonOut(json_encode(array("launch" => $_REQUEST['appid'])));
                }
                else {
                    badReq('App already running!');
                }
            } else {
                badReq('Wrong verb or no appid');
            }

            break;

        case 'move':


            if ( isPOST() && isset($_REQUEST['appid']))
            {
                $newSlot = moveApp($_REQUEST['appid']);
                header('Content-Type: application/json');
                echo json_encode(array("slot" => $newSlot));
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

