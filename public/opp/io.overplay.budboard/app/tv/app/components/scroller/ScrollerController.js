/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "scrollerController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, $window ) {

        console.log( "Loading BudBoard scrollerController" );

        $scope.messageArray = [ "Budweiser Board",
            "Change messages in Control App!",
            "Enjoy Responsibly" ];

        var logLead = "BudBoard scrollerController: ";


        function modelUpdate( data ) {

            $log.info( logLead + " got a model update: " + angular.toJson( data ) );
            $scope.messageArray = data;

        }

        optvModel.init( {
            appName:      "io.overplay.budboard",
            endpoint:     "tv",
            dataCallback: modelUpdate,
            initialValue: $scope.messageArray
        } );

    } );


app.directive( 'cssFader', [
        '$log', '$timeout',
        function ( $log, $timeout ) {
            return {
                restrict:    'E',
                scope:       {
                    messageArray: '='
                },
                templateUrl: 'app/components/scroller/cssfader.template.html',
                link:        function ( scope, elem, attrs ) {

                    var idx = 0;

                    scope.message = { text: "", fadein: false };
                    scope.message.text = scope.messageArray[ idx ];


                    function nextMsg() {
                        idx++;
                        if ( idx == scope.messageArray.length ) idx = 0;
                        scope.message.fadein = false;
                        $timeout( scroll, 2000 );
                    }


                    function scroll() {
                        scope.message.fadein = true;
                        scope.message.text = scope.messageArray[ idx ];
                        $timeout( nextMsg, 8000 );
                    }

                    $timeout( scroll, 2000 );

                }
            }
        } ]
);
