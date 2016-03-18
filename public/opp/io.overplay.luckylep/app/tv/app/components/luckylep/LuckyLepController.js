/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "luckyLepController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, $window ) {


        $scope.lep = { winner: "treb", show: false };
        $scope.guests = []

        function getGuests(){

            $http.get("http://162.243.133.57:1337/api/v2/guest")
                .then( function(data){

                    $scope.guests = data.data;

                }, function(err){

                })
        }

        function pickVictim(){

            if ($scope.guests.length){

                var rn = Math.floor( Math.random() * ($scope.guests.length) );
                $scope.lep.winner = $scope.guests[rn].firstName+" "+ $scope.guests[ rn ].lastName;
                $scope.lep.show = true;
                getGuests();
                $timeout(function(){
                    $scope.lep.show = false;
                }, 30*1000);
            }

        }
        
        function modelUpdate( data ) {
           

        }

        function inboundMessage( msg ) {
            pickVictim()
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

        $interval(pickVictim, 3*60*1000)
        getGuests()

    } );
