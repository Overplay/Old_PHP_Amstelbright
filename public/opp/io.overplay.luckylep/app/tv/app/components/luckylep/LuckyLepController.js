/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "luckyLepController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, $window ) {


        $scope.lep = { winner: "treb", show: true };
        
        function modelUpdate( data ) {
           

        }

        function inboundMessage( msg ) {
        }

        function updateFromRemote() {

            optvModel.init( {
                appName:         "io.overplay.luckylep",
                endpoint:        "tv",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage,
                initialValue:    { lepData: {} },
            } );

        }

        updateFromRemote();

    } );
