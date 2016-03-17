/**
 * Created by eadams on 3/5/16.
 */

app.controller( "fantasyNBAController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, $window ) {

        console.log( "Loading fantasyNBAController" );

        $scope.position = { corner: 0 };

        $scope.update = {
            animate: false,
            animateDone: false,
            message: "",
            img: ""
        };

        $scope.points = 0;
        $scope.topScorer = "";
        $scope.lowestScorer = "";

        var _remoteScore = {};

        function logLead() { return "FantasyNBAController: "; }

        $scope.$on( 'CPANEL', function () {

            $scope.position.corner++;
            if ( $scope.position.corner > 3 ) $scope.position.corner = 0;

        } );

        var previousUpdateKeyValueStore = {};
        var updateQueue = [];

        $interval(function(){
        console.log("in this thing " + updateQueue.length)
            if(updateQueue.length){
                var nextUpdate = updateQueue.shift();
                $scope.update.message = nextUpdate.msg;
                $scope.update.image = nextUpdate.image;
                console.log(nextUpdate);
                $scope.update.animate = true;
                $scope.update.animateDone = false;
                $timeout(function(){
                    //$scope.update.animate = false;
                    $scope.update.animateDone = true;
                }, 4500);
                $timeout(function(){
                    $scope.update.animate = false;
                    $scope.update.animateDone = false;
                }, 5500);

            }
        }, 7000);

        function updateLocalScore() {
            var points = 0;
            var topScorer = undefined;
            var lowestScorer = undefined;

            if(_remoteScore.team){
                _remoteScore.team.forEach(function(player){
                    if(player.thisWeek){
                        //checks if this is the first entry for the player
                        //if so, will update the info without issuing a notification
                        if(!previousUpdateKeyValueStore[player.PlayerID]){
                            previousUpdateKeyValueStore[player.PlayerID] = player;
                        }
                        else if(previousUpdateKeyValueStore[player.PlayerID].thisWeek.fantasy != player.thisWeek.fantasy){
                            if((differential = player.thisWeek.freeThrows - previousUpdateKeyValueStore[player.PlayerID].thisWeek.freeThrows) > 0){
                                updateQueue.push({
                                    msg: player.FirstName + " " + player.LastName + " made " + differential + " free throw" + (differential > 1 ? "s" : " "),
                                    image: player.PhotoUrl
                                });
                            }
                            if((differential = player.thisWeek.assists - previousUpdateKeyValueStore[player.PlayerID].thisWeek.assists) > 0){
                                updateQueue.push({
                                    msg: player.FirstName + " " + player.LastName + " had " + differential + " assist" + (differential > 1 ? "s" : ""),
                                    image: player.PhotoUrl
                                });
                            }
                            if((differential = player.thisWeek.threePointers - previousUpdateKeyValueStore[player.PlayerID].thisWeek.threePointers) > 0){
                                updateQueue.push({
                                    msg: player.FirstName + " " + player.LastName + " made " + (differential == 1 ? " a three" : differential + " threes"),
                                    image: player.PhotoUrl
                                });
                            }
                            previousUpdateKeyValueStore[player.PlayerID].thisWeek = player.thisWeek;
                        }
                        points += player.thisWeek.fantasy;
                        if(!topScorer || topScorer.thisWeek.fantasy < player.thisWeek.fantasy)
                        {
                            topScorer = player;
                        }
                        if(!lowestScorer || lowestScorer.thisWeek.fantasy > player.thisWeek.fantasy)
                        {
                            lowestScorer = player;
                        }
                    }
                })
            }
            $scope.points = points;
            $scope.topScorer = topScorer ? topScorer.FirstName + " " + topScorer.LastName : "";
            $scope.lowestScorer = lowestScorer ? lowestScorer.FirstName + " " + lowestScorer.LastName : "";
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
                appName:         "io.overplay.fantasyNBA",
                endpoint:        "tv",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage,
                initialValue:    { }
            } );

        }

        updateFromRemote();

    } );
