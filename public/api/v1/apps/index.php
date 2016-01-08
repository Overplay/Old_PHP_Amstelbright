<?php

/**
 * OVERPLAY APPS OS ENDPOINT
 * Port of NodeJS version
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require('../shared/shared.php');
require('../shared/messaging.php');
require('../shared/apps.php');


if (isset($_REQUEST['command'])) {

    $cmd = $_REQUEST['command'];
    switch ($cmd) {

        //In place of "isMain" in Node
        case 'getlauncher':

            $launcher = array(
                "name" => "App Picker",
                "appType" => "fullscreen",
                "reverseDomainName" => "io.overplay.apppicker",
                "buildNumber" => 1,
                "onLauncher" => false,
                "isMain" => true,
                "size" => array(
                    "width" => 100,
                    "height" => 100
                ),
                "publisher" => "overplay.io"
            );

            echo json_encode($launcher);

            break;

        case 'userapps':

            $rval = array();
            foreach ( installedApps() as $key=>$value ){
                array_push($rval, $value);
            }
            echo json_encode( $rval );
            break;



    }


} else {
    badReq('no test parameter');
}