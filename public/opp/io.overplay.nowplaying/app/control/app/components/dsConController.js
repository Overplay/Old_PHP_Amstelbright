/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "dsConController",
    function ( $scope, $timeout, $http, $log, optvModel ) {

        $log.info( "Loading dsConController" );

        var logLead = "NowPlaying Control App: ";
        $scope.shows = [];
        $scope.shouldHide = false;

        function modelUpdate( data ) {

            $log.info( logLead + " got a model update: " + angular.toJson( data ) );
            $scope.shows = data.shows;
            $scope.shouldHide = data.hide;

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
            optvModel.model = { shows: $scope.shows, hide: $scope.shouldHide };
            optvModel.save();
        }

        $scope.del = function(index){
            $scope.shows.splice(index, 1);
        }

        $scope.toggleHide = function(){
            $scope.shouldHide = !$scope.shouldHide;
        }


        initialize();

    } );
