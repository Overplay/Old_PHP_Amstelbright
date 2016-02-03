/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "dartsController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, $window ) {

        console.log( "Loading dartsController" );

        $scope.position = { corner: 0 };
        $scope.score = { red: 0, blue: 0, redHighlight: false, blueHighlight: false };

        var _remoteScore = {};

        function logLead() { return "DartsController: "; }

        $scope.$on( 'CPANEL', function () {

            $scope.position.corner++;
            if ( $scope.position.corner > 3 ) $scope.position.corner = 0;

        } );

        function updateLocalScore() {

            var animRed = $scope.score.red < _remoteScore.red;
            var animBlue = $scope.score.blue < _remoteScore.blue;

            $scope.score.red = _remoteScore.red;
            $scope.score.blue = _remoteScore.blue;


            if ( animRed ) {
                $scope.score.redHighlight = true;
                $timeout( function () { $scope.score.redHighlight = false}, 500 );
            }

            if ( animBlue ) {
                $scope.score.blueHighlight = true;
                $timeout( function () { $scope.score.blueHighlight = false}, 500 );
            }
        }

        function modelUpdate( data ) {
            //$scope.$apply(function () {
            $log.info( logLead() + " got a model update: " + angular.toJson( data ) );
            _remoteScore = data;
            updateLocalScore();

            //});

            $log.debug( logLead() + "Model update callback..." )

        }

        function inboundMessage( msg ) {
            $log.debug( logLead() + "Inbound message..." );
        }

        function updateFromRemote() {

            optvModel.init( {
                appName:         "io.overplay.darts",
                endpoint:        "tv",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage,
                initialValue:    { red: 0, blue: 0, toTV: undefined },
            } );

        }

        updateFromRemote();

    } );
