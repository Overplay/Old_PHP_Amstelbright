<?php
/**
 * Created by PhpStorm.
 * User: mkahn
 * Date: 3/25/16
 * Time: 11:37 AM
 */


/** Simple test to see if this ancient version of Slim will run on NeTV hardware */

 require_once ('slim/Slim/Slim.php');

 $app = new Slim();

 $app->get('/hello/:name', function ($name) {
   echo "Hello, " . $name;
 });
 $app->run();