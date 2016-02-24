/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "bbConController",
    function ( $scope, $timeout, $http, $log, optvModel ) {

        $log.info( "Loading bbConController" );

        var logLead = "BB Control App: ";
        $scope.inboundMessageArray = [];
        $scope.messageArray = [];

        $scope.ui = { json: ""};
        $scope.tvTerms = [];
        function modelUpdate( data ) {

            $log.info( logLead + " got a model update: " + angular.toJson( data ) );
            $scope.messageArray = data;
            $scope.tvTerms = [];
            data.forEach(function(term){
                $scope.tvTerms.push(term);

            })

        }

        function inboundMessage( msg ) {
            $log.debug( logLead + "Inbound message..." );
        }

        function initialize() {

            optvModel.init( {
                appName:         "io.overplay.tweeterer",
                endpoint:        "control",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage
            } );

        }

        $scope.add = function () {
            if(!$scope.input.newMsg.length){
                return;
            }
            if(!(Array.isArray($scope.messageArray))){
                $scope.messageArray = [];
            }
            $scope.messageArray.push( $scope.input.newMsg );
            $scope.input.newMsg = '';
        }

        $scope.done = function () {
            optvModel.model = $scope.messageArray;
            optvModel.save();
            $scope.tvTerms = [];
            optvModel.model.forEach(function(term){
                $scope.tvTerms.push(term);
            })
        }

        $scope.del = function(index){
            $scope.messageArray.splice(index, 1);
        }

        initialize();

    } );
