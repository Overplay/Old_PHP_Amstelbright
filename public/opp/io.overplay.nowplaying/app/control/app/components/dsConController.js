/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "dsConController",
    function ( $scope, $timeout, $http, $log, optvModel ) {

        $log.info( "Loading dsConController" );

        var logLead = "NowPlaying Control App: ";
        $scope.inboundMessageArray = [];
        $scope.shows = [];

        function modelUpdate( data ) {

            $log.info( logLead + " got a model update: " + angular.toJson( data ) );
            $scope.shows = data;


        }

        function inboundMessage( msg ) {
            $log.debug( logLead + "Inbound message..." );
        }

        function initialize() {

            optvModel.init( {
                appName:         "io.overplay.nowplaying",
                endpoint:        "control",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage
            } );

        }

        $scope.add = function () {
            $scope.shows.push( { desc: "new show", time: "12:00 AM"} );
        }

        $scope.update = function () {
            optvModel.model = $scope.shows;
            optvModel.save();
        }

        $scope.del = function(index){
            $scope.shows.splice(index, 1);
        }


        initialize();

    } );
