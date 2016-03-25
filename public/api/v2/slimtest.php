<?php
/**
 * Created by PhpStorm.
 * User: mkahn
 * Date: 3/25/16
 * Time: 11:37 AM
 */


/** Simple test to see if this ancient version of Slim will run on NeTV hardware.
 *
 *   http://<blah blah>/api/v2/slimptest.php/hello/Dude
 *   Should respond in browser "Hello, Dude"
 *
 */

require_once('slim/Slim/Slim.php');

$app = new Slim();

/* PHP 5.2 does NOT support anon function which totally sucks, but whatever */

function sayit($name)
{
    echo "Hello, " . $name;
}

/* Note the WONKY ASS way PHP5.2 passes functions... */

$app->get('/hello/:name', 'sayit');
$app->run();