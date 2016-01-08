<?php
/**
 * Created by PhpStorm.
 * User: mkahn
 * Date: 1/5/16
 * Time: 9:19 PM
 */


function isAppRunning($appid)
{
    $ra = runningApps();
    return array_key_exists($appid, $ra);
}

function runningApps()
{
    return loadJSON("runningApps", array());
}

function runApp($appid)
{

    $ra = runningApps();
    $ia = installedApps();

    if (!array_key_exists($appid, $ia) || array_key_exists($appid, $ra)) {
        return false;
    }

    $torun = $ia[$appid];
    $ra[$appid] = $torun;
    saveJSON("runningApps", $ra);
    return true;


}

function appsByState()
{

    $running = array();
    $available = array();
    $ra = runningApps();
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