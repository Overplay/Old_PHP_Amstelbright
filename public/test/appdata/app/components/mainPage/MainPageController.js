/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "mainPageController", function ( $scope,  $log, optvModel, $routeParams ) {

        $log.info( "Loading mainPageController" );

        $scope.mode = $routeParams.mode || "Control";

        optvModel.init( {
            appName:  "io.overplay.adtest",
            endpoint: $scope.mode,
            dataCallback: newData,
            messageCallback: newMessage

        } );

        $scope.appdata = {

            outboundJsonString: 'no data yet',
            inboundJsonString: 'no data yet',
            updateTime: '-'

        }

        function newData(inboundData) {
            $scope.appdata.inboundJsonString = angular.toJson(inboundData);
            $scope.appdata.updateTime = new Date();
        }

        function newMessage(msg){
        }

        $scope.sendData = function(){

            $log.info("Sending data...");
            try {
                var newPayload = JSON.parse( $scope.appdata.outboundJsonString );
                optvModel.model = newPayload;
                optvModel.save();
            } catch(err){
                $scope.appdata.outboundJsonString = "bad json";
            }

        }

    } );
