/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "dartsController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, $window ) {

        console.log( "Loading dartsController" );

        $scope.position = { corner: 0 };
        $scope.score = { red: 0, blue: 0, redHighlight: false, blueHighlight: false };

        $scope.turns = [];
        $scope.turnsSkip = 0;

        var _remoteScore = {};

        function logLead() { return "DartsController: "; }

        $scope.$on( 'CPANEL', function () {

            $scope.position.corner++;
            if ( $scope.position.corner > 3 ) $scope.position.corner = 0;

        } );

        function updateLocalScore() {
            var animRed = false, animBlue = false;

            $scope.score.red = _remoteScore.red;
            $scope.score.blue = _remoteScore.blue;

            if($scope.turns.length != _remoteScore.turns.length){
                $scope.turns = _remoteScore.turns;
                animRed = true;
                animBlue = true;
            }
            $scope.turnsSkip = $scope.turns.length > 9 ? $scope.turns.length - 9 : 0;

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
                initialValue:    { red: 501, blue: 501, redTemp: 0, blueTemp: 0, turns: [], toTV: undefined },
            } );

        }

        updateFromRemote();

    } );
