/**
 * Created by eadams on 3/1/16.
 */

app.controller( "optvFantasyConApp",
    function ( $scope, $timeout, $http, $log, optvModel ) {

        $log.info( "Loading FantasyNBAConController" );

        $scope.ui = { show: false };

        var allActivePlayersInfo = undefined;

        function updateActivePlayersInfo(){
            var req = {
                method: 'GET',
                url: 'http://lvh.me:3000/Players'
            }

            $http(req).then(function(data){
                allActivePlayersInfo = data.data;
                console.log(data);
            })
        }

        if(allActivePlayersInfo == undefined) updateActivePlayersInfo();

        $scope.team = [];

        $scope.newPlayer = {firstName: "", lastName: ""};

        $scope.addNewPlayerToTeam = function(){
            if(!allActivePlayersInfo){
                $timeout($scope.addNewPlayerToTeam, 1000);
            }
            else{
                for(var i = 0; i < allActivePlayersInfo.length; i++){
                    if(allActivePlayersInfo[i].FirstName.toLowerCase() == $scope.newPlayer.firstName.toLowerCase() &&
                       allActivePlayersInfo[i].LastName.toLowerCase() == $scope.newPlayer.lastName.toLowerCase()
                    ){
                        var onTeam = false;
                        $scope.team.forEach(function(player){
                            if(player.PlayerID == allActivePlayersInfo[i].PlayerID){
                                alert("Player already on team");
                                onTeam = true;
                                return;
                            }
                        })
                        if(!onTeam){
                            $scope.team.push(allActivePlayersInfo[i]);
                            addPointsToPlayer(allActivePlayersInfo[i]);
                            if(fantasyDataInLastWeekReady){
                                fillInPlayerInformation(allActivePlayersInfo[i]);
                            }
                            optvModel.model.team = $scope.team;
                            optvModel.save();
                        }
                        return;
                    }
                }
                alert("Not found");
            }
        }

        function addPointsToPlayer(player){
            var req = {
                method: 'GET',
                url: 'http://lvh.me:3000/PlayerSeasonStatsByPlayer/2016/' + player.PlayerID
            }

            $http(req).then(function(data){
                player.points = data.data.FantasyPoints;
                console.log(data);
                console.log(player.points);
            })
        }

        function ready() {
            $scope.ui.show = true;
        }

        function dataChanged( data ) {

        }

        function inboundMessage( data ) {
            $log.info( "ShuffleCon: got inbound message." );
        }

        function initialize() {

            optvModel.init( {
                appName:         "io.overplay.fantasyNBA",
                endpoint:        "control",
                initialValue: {
                    team: [],
                    topScorer: undefined,
                    lowestScorer: undefined
                },
                dataCallback:    dataChanged,
                messageCallback: inboundMessage
            } );
        }

        $scope.resetScores = function () {
            optvModel.model.team = [];
            optvModel.model.topScorer = undefined;
            optvModel.model.lowestScorer = undefined;
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
        }

        var fantasyDataInLastWeek = [], fantasyDataInLastWeekReady = false;

        function getAndAddFantasyDataForDate(date)
        {
            var req = {
                method: 'GET',
                url: 'http://lvh.me:3000/BoxScoresDelta/' + date.toDateString() + '/10000000'
            }

            var callback = function(data){
                fantasyDataInLastWeek.push(data.data);

                console.log("Got info for " + date.toDateString());
                date.setDate(date.getDate() - 1);
                getAndAddFantasyDataForDate(date);
            }

            if(date.getDay() == 0){
                callback = function(data){
                    fantasyDataInLastWeek.push(data.data);
                    fantasyDataInLastWeekReady = true;
                    console.log("fantasyData for last week is ready");
                    console.log(fantasyDataInLastWeek);
                    fillInExistingPlayers();
                }
            }
            $http(req).then(callback);
        }

        function fillInExistingPlayers(){
            $scope.team.forEach(fillInPlayerInformation);
            optvModel.model.team = $scope.team;
            optvModel.save();
        }

        function fillInPlayerInformation(Player){
            var fantas = 0, points = 0, assists = 0, freeThrows = 0, threePointers = 0;

            fantasyDataInLastWeek.forEach(function(daily){
                daily.forEach(function(game){
                    game.PlayerGames.forEach(function(playerGame){
                        if(playerGame.Name == (Player.FirstName + " " + Player.LastName)){
                            fantas += playerGame.FantasyPoints;
                            points += playerGame.Points;
                            assists += playerGame.Assists;
                            freeThrows += playerGame.FreeThrowsMade;
                            threePointers += playerGame.ThreePointersMade;

                        }
                    })
                })
            });
            Player.thisWeek = {fantasy: fantas, points: points, assists: assists, freeThrows: freeThrows, threePointers: threePointers};
        }

        $scope.simulateUpdate = function(){
            var key = "freeThrows";
            var rand = Math.floor(Math.random() * 3);
            if(rand == 0){
                key = "freeThrows";
            }
            else if(rand == 1){
                key = "assists";
            }
            else{
                key = "threePointers";
            }
            if($scope.team.length){
                var idx = Math.floor(Math.random() * $scope.team.length);
                $scope.team[idx].thisWeek[key]++;
                $scope.team[idx].thisWeek.fantasy++;
                optvModel.model.team = $scope.team;
                optvModel.save();
            }
        }

        getAndAddFantasyDataForDate(new Date());

        initialize();

    } );