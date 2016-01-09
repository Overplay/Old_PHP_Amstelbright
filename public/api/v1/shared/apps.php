<?php
/**
 * Created by PhpStorm.
 * User: mkahn
 * Date: 1/5/16
 * Time: 9:19 PM
 */


function signalAppLaunch($app)
{

    //Not sure we really need to signal to mainframe that an app launch happened, a "layout" message should be enough
    postAppMessage('io.overplay.overplayos', 'io.overplay.mainframe.tv', array('launch' => $app));
    signalLayoutChange();

}

function signalLayoutChange()
{
    postAppMessage('io.overplay.overplayos', 'io.overplay.mainframe.tv', array("layout" => true));
}

/******************************************************/

function moveApp($appid)
{

    $runningApps = loadJSON('runningApps', array());
    return 3;
}


function isAppRunning($appid)
{
    $ra = runningApps();
    return array_key_exists($appid, $ra);
}

function runningApps()
{
    $rval = array();
    $running = loadJSON("runningApps", array());

    foreach ($running as $key => $value) {
        array_push($rval, $value);
    }

    return $rval;

}

function runApp($appid)
{

    $ra = loadJSON("runningApps", array());
    $ia = installedApps();

    // Puke if not installed or already running
    if (!array_key_exists($appid, $ia) || array_key_exists($appid, $ra)) {
        return array("success"=>false, "msg"=>"No such app, or app already running");
    }

    $torun = $ia[$appid];

    if ( placeAppOnDisplay($torun) > -1) {
        //app . src = '/opp/' + app . reverseDomainName + '/app/tv/index.html';
        $ra[$appid] = $torun;
        saveJSON("runningApps", $ra);
        //setIframePositions();
        signalAppLaunch($torun);
        return array("success" => true, "msg" => "App launched");
    } else {
        return array("success" => false, "msg" => "Could not place app in slot");

    }

}

function killApp($appid)
{

    $ra = loadJSON("runningApps", array());
    $ia = installedApps();

    // Puke if not installed or already running
    if (!array_key_exists($appid, $ia) || !array_key_exists($appid, $ra)) {
        return array("success" => false, "msg" => "No such app, or app not running");
    }

    $todie = $ra[$appid];
    unset($ra[$appid] );
    saveJSON("runningApps", $ra);

    $sm = screenMap();

    foreach ($sm['widgetAppMap'] as $key=>$value){
        if ( $value['reverseDomainName']==$appid) {
            unset($sm['widgetAppMap'][$key]);
            break;
        }
    }

    foreach ($sm['crawlerAppMap'] as $key => $value) {
        if ($value['reverseDomainName'] == $appid) {
            unset($sm['crawlerAppMap'][$key]);
            break;
        }
    }

    foreach ($sm['fullScreenAppMap'] as $key => $value) {
        if ($value['reverseDomainName'] == $appid) {
            unset($sm['fullScreenAppMap'][$key]);
            break;
        }
    }

    saveJSON("screenMap", $sm);
    return array("success" => true, "msg" => "Killed sum shit");


}

function appsByState()
{

    $running = array();
    $available = array();
    $ra = loadJSON("runningApps", array());
    $ia = installedApps();

    foreach ($ia as $key => $value) {

        if (array_key_exists($key, $ra)) {
            //It's  running
            array_push($running, $value);
        } else {
            array_push($available, $value);
        }
    }

    return array("running" => $running, "dormant" => $available);
}

function screenMap()
{

    $sm = loadJSON("screenMap", array("widgetAppMap" => array(),
        "crawlerAppMap" => array(),
        "fullScreenAppMap" => array()));

    return $sm;

}

function numRunningApps($appType)
{

    $rval = 0;
    $ra = runningApps();

    forEach ($ra as $value) {
        if ($value['appType'] == $appType)
            $rval++;
    };

    return $rval;

}

function placeAppOnDisplay($app)
{

    $sm = screenMap();

    switch ($app['appType']) {

        case 'widget':

            array_push($sm['widgetAppMap'], $app);
            if ( count($sm['widgetAppMap']) > 5 ){
                $sm['widgetAppMap'] = array_slice($sm['widgetAppMap'], 1, 4);
            }

            saveJSON("screenMap", $sm);
            return count($sm['widgetAppMap']) - 1;

            break;

        case 'crawler':

            array_push($sm['crawlerAppMap'], $app);
            if (count($sm['crawlerAppMap']) > 2) {
                $sm['crawlerAppMap'] = array_slice($sm['crawlerAppMap'], 1, 2);
            }

            saveJSON("screenMap", $sm);

            return count($sm['crawlerAppMap']) - 1;

            break;

        case 'fullscreen':


            array_push($sm['fullScreenAppMap'], $app);
            if (count($sm['fullScreenAppMap']) > 1) {
                $sm['fullScreenAppMap'] = array_slice($sm['fullScreenAppMap'], 1, 1);
            }

            saveJSON("screenMap", $sm);

            return 0;

            break;

    }

}

function setIframePositions()
{

    //Do the widgets first

    $sm = screenMap();

    //TODO HACK ALERT implement screen size feedback
    $screenRect = loadJSON("screenRect", array("width" => 1920, "height" => 1080));

    for ($widx = 0; $widx < count($sm["widgetAppMap"]); $widx++) {

        if (!$sm['widgetAppMap'][$widx]) continue;

        $sm['widgetAppMap'][$widx]['location'] = array("top" => 0, "left" => 0);

        //TODO implement server side nudge
        //var nudge = {
        //top:
        //0, left: 0 };

        $nudge = array("top" => 0, "left" => 0);


        switch ($widx) {

            case 0:
                $sm['widgetAppMap'][$widx]['location']['top'] = floor(.05 * $screenRect['height']) + $nudge['top'] . 'px';
                $sm['widgetAppMap'][$widx]['location']['left'] = floor(.03 * $screenRect['width']) + $nudge['left'] . 'px';

                break;

            case 1:

                $sm['widgetAppMap'][$widx]['location']['top'] = floor(.05 * $screenRect['height']) + $nudge['top'] . 'px';
                $sm['widgetAppMap'][$widx]['location']['left'] = floor(.85 * $screenRect['width']) + $nudge['left'] . 'px';

                break;

            case 2:
                $sm['widgetAppMap'][$widx]['location']['top'] = floor(.6 * $screenRect['height']) + $nudge['top'] . 'px';
                $sm['widgetAppMap'][$widx]['location']['left'] = floor(.85 * $screenRect['width']) + $nudge['left'] . 'px';

                break;

            case 3:
                $sm['widgetAppMap'][$widx]['location']['top'] = floor(.6 * $screenRect['height']) + $nudge['top'] . 'px';
                $sm['widgetAppMap'][$widx]['location']['left'] = floor(.03 * $screenRect['width']) + $nudge['left'] . 'px';

                break;

        }


    }

    //Do the crawler next
    for ($cidx = 0; $cidx < count($sm["crawlerAppMap"]); $cidx++) {

        if (!$sm['widgetAppMap'][$cidx]) continue;

        $sm['widgetAppMap'][$cidx]['location'] = array("top" => 0, "left" => 0);

        //TODO implement server side nudge
        //var nudge = {
        //top:
        //0, left: 0 };

        $nudge = array("top" => 0, "left" => 0);


       //HARD CODE for DEMO
        $sm['widgetAppMap'][$cidx]['location']['left'] = '0px';

        switch ($cidx) {

            case 0:
                $sm['widgetAppMap'][$cidx]['location']['top'] = floor(.89 * $screenRect['height']) . $nudge['top'] . 'px';
                break;

            case 1:
                $sm['widgetAppMap'][$cidx]['location']['top'] = floor(.03 * $screenRect['height']) . $nudge['top'] . 'px';
                break;

        }

    }

    if ( count( $sm['fullScreenAppMap'] ) > 0) {

        $sm['fullScreenAppMap'][0]['location'] = array("top" => 0, "left" => 0);

    }

    saveJSON("screenMap", $sm);

}


function installedApps()
{


    return array(

        "io.overplay.shuffleboard" => array(
            "name" => "Shuffleboard",
            "appType" => "widget",
            "reverseDomainName" => "io.overplay.shuffleboard",
            "buildNumber" => 1,
            "onLauncher" => true,
            "iconLauncher" => "shuffle320x180.png",
            "size" => array(
                "width" => 25,
                "height" => 40
            ),
            "publisher" => "overplay.io"
        ),

        "io.overplay.budboard" => array(
            "name" => "Bud Board",
            "appType" => "crawler",
            "reverseDomainName" => "io.overplay.budboard",
            "buildNumber" => 1,
            "onLauncher" => true,
            "iconLauncher" => "budboard16x9.png",
            "size" => array(
                "width" => 100,
                "height" => 10
            ),
            "publisher" => "overplay.io"

        ),

        "io.overplay.dailyspecials" => array(
            "name" => "Daily Specials",
            "appType" => "crawler",
            "reverseDomainName" => "io.overplay.dailyspecials",
            "buildNumber" => 1,
            "onLauncher" => true,
            "iconLauncher" => "special16x9.png",
            "size" => array(
                "width" => 100,
                "height" => 10
            ),
            "publisher" => "overplay.io"

        ),

        "io.overplay.squares" => array(
            "name" => "Squares",
            "appType" => "widget",
            "reverseDomainName" => "io.overplay.squares",
            "buildNumber" => 1,
            "onLauncher" => true,
            "iconLauncher" => "football16x9.png",
            "size" => array(
                "width" => 25,
                "height" => 40
            ),
            "publisher" => "overplay.io"

        ),


    );


}