<?php
/**
 * Created by PhpStorm.
 * User: mkahn
 * Date: 1/18/16
 * Time: 3:13 PM
 */

function loadMessages($forDest)
{
    $appMessages = loadJSON("messages/".$forDest, array());
    return $appMessages;
}

function saveMessages($forDest, $appMessages)
{
    saveJSON("messages/" .$forDest, $appMessages);
}

function createAppMessage($src, $dest, $messageData)
{

    return array("src" => $src, "dest" => $dest, "messageData" => $messageData, 'mstime' => time() . '000');
}

function postAppMessage($src, $dest, $messageData)
{

    $appMessages = loadMessages($dest);
    array_push($appMessages, createAppMessage($src, $dest, $messageData));
    saveMessages($dest, $appMessages);

}

function popAppMessage($dest)
{

    $appMessages = loadMessages($dest);
    $numMsgs = count($appMessages);

    $i = 0;

    while ($i < $numMsgs) {
        $msg = $appMessages[$i];
        if (strcmp($msg["dest"], $dest) == 0) {
            $m = array_splice($appMessages, $i, 1);
            saveMessages($dest, $appMessages);
            return $m;
        }

        $i++;
    }

    return array();


}

function popAppMessages($dest)
{

    $appMessages = loadMessages($dest);
    saveMessages($dest, array());
    return $appMessages;


}
