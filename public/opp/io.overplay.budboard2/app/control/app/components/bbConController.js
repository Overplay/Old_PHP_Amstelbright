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

        function modelUpdate( data ) {

            $log.info( logLead + " got a model update: " + angular.toJson( data ) );
            $scope.messageArray = data.messages;
            $scope.ui.json = angular.toJson($scope.messageArray);

        }

        function inboundMessage( msg ) {
            $log.debug( logLead + "Inbound message..." );
        }

        function initialize() {

            optvModel.init( {
                appName:         "io.overplay.budboard2",
                endpoint:        "control",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage
            } );

        }

        $scope.add = function () {
            $scope.messageArray.push( $scope.input.newMsg );
            $scope.input.newMsg = '';
        }

        $scope.done = function () {
            optvModel.model = $scope.messageArray;
            optvModel.save();
        }


        initialize();

    } );
