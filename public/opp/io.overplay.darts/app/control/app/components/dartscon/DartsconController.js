/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "dartsconController",
    function ( $scope, $timeout, $http, $log, optvModel ) {

        $log.info( "Loading shuffconController" );

        $scope.ui = { show: false };

        function ready() {
            $scope.ui.show = true;
        }

        function dataChanged( data ) {

        }

        function inboundMessage( data ) {
            $log.info( "ShuffleCon: got inbound message." );
        }

        $scope.redScore = function () { return optvModel.model.scores ? optvModel.model.scores.red : undefined }
        $scope.blueScore = function () {  return optvModel.model.scores ? optvModel.model.scores.blue : undefined }

        $scope.redTempScore = function () { return optvModel.model.redTemp; }
        $scope.blueTempScore = function () { return optvModel.model.blueTemp; }

        function initialize() {

            optvModel.init( {
                appName:         "io.overplay.darts",
                endpoint:        "control",
                initialValue:    { scores: {red: 501, blue: 501}, turns: [], redTemp: 0, blueTemp: 0 },
                dataCallback:    dataChanged,
                messageCallback: inboundMessage
            } );

        }

        var changeBlueTempTimeout;

        $scope.changeBlueTempBegin = function ( by ) {

            optvModel.model.blueTemp = optvModel.model.blueTemp + by;
            if ( optvModel.model.blueTemp < 0 ) optvModel.model.blueTemp = 0;
            optvModel.save();
            changeBlueTempTimeout = $timeout(function(){ $scope.changeBlueTempBegin( by ) }, 100);
        }

        $scope.changeBlueTempEnd = function(){
            $timeout.cancel(changeBlueTempTimeout);
        }

        var changeRedTempTimeout;

        $scope.changeRedTempBegin = function ( by ) {

            optvModel.model.redTemp = optvModel.model.redTemp + by;
            if ( optvModel.model.redTemp < 0 ) optvModel.model.redTemp = 0;
            optvModel.save();
            changeRedTempTimeout = $timeout(function(){ $scope.changeRedTempBegin( by ) }, 100);
        }

        $scope.changeRedTempEnd = function(){
            $timeout.cancel(changeRedTempTimeout);
        }

        $scope.finishTurn = function(){

            optvModel.model.turns.push({
                red: optvModel.model.redTemp,
                blue: optvModel.model.blueTemp
            });

            optvModel.model.scores.red = optvModel.model.scores.red - optvModel.model.redTemp;
            if(optvModel.model.scores.red < 0) optvModel.model.scores.red = 0;
            optvModel.model.scores.blue = optvModel.model.scores.blue - optvModel.model.blueTemp;
            if(optvModel.model.scores.blue < 0) optvModel.model.scores.blue = 0;

            optvModel.model.redTemp = 0;
            optvModel.model.blueTemp = 0;

            optvModel.save();
        }


        $scope.resetScores = function () {
            optvModel.model.scores = {red:501, blue: 501};
            optvModel.model.turns = [];
            optvModel.model.blueTemp = 0;
            optvModel.model.redTemp = 0;
            optvModel.save();

        }

        $scope.home = function () {

            optvModel.postMessage( { dest: "io.overplay.mainframe", data: { dash: 'toggle' } } );

        }

        $scope.move = function () {

            optvModel.moveApp()
                .then( function ( newSlot ) {
                    $log.info( "ShuffleControl. Moved to slot: " + numSlot );

                }, function ( err ) {
                    $log.info( "ShuffleControl. FAIL moving app: " + err );

                } );

            //optvModel.postMessage({
            //    to: "io.overplay.mainframe",
            //    data: {move: {spot: "next", app: "io.overplay.shuffleboard"}}
            //});

        }


        initialize();

    } );
