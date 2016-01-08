<?php
/**
 * Created by PhpStorm.
 * User: mkahn
 * Date: 1/5/16
 * Time: 1:51 PM
 */


function loadMessages()
{
    $appMessages = loadJSON('appmessages',array());
    return $appMessages;
}

function saveMessages($appMessages)
{
    saveJSON( 'appmessages', $appMessages );
}

function createAppMessage($from, $dest, $messageData){

    return array("from"=>$from, "dest"=>$dest, "messageData"=>$messageData, 'mstime'=> time() . '000');
}

function postAppMessage($from, $dest, $messageData){

    $appMessages = loadMessages();
    array_push($appMessages, createAppMessage($from, $dest, $messageData));
    saveMessages($appMessages);

}

function popAppMessage($dest){

    $appMessages = loadMessages();
    $numMsgs = count($appMessages);

    $i = 0;

    while ( $i < $numMsgs )
    {
        $msg = $appMessages[$i];
        if ( strcmp( $msg["dest"], $dest) == 0 ){
            $m = array_splice($appMessages, $i, 1);
            saveMessages($appMessages);
            return $m;
        }

        $i++;
    }

    return array();


}