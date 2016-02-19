/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "scrollerController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, $window ) {

        console.log( "Loading scrollerController" );

        $scope.messageArrayTest = [
            "$5.99 hot wings until 10:30",
            "2-for-1 Long Island Ice Teas",
            "Coming Up at 1:25 - 49ers @ AZ Cardinals" ];

        $scope.messageArray = [ "Daily Specials from Overplay", "Change your messages via Control App" ];

        function logLead() { return "scrollerController: "; }

        function updateLocalData() {


        }

        function modelUpdate( data ) {

            $log.info( logLead() + " got a model update: " + angular.toJson( data ) );
            $scope.messageArray = data.messages;


        }

        function inboundMessage( msg ) {
            $log.debug( logLead() + "Inbound message..." );
        }

        function updateFromRemote() {

            optvModel.init( {
                appName:         "io.overplay.dailyspecials",
                endpoint:        "tv",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage,
                initialValue:    { messages: $scope.messageArray }
            } );

        }

        updateFromRemote();


    } );

app.directive( 'marqueeScroller', [
        '$log',
        function ( $log ) {
            return {
                restrict:    'E',
                scope:       {
                    messageArray: '='
                },
                templateUrl: 'app/components/scroller/marqueescroller.template.html',
                link:        function ( scope, elem, attrs ) {
                    "use strict";
                    var idx = 0;
                    scope.currentScroller = scope.messageArray[ idx ];

                    elem.bind( 'onfinish', function ( ev ) {
                        idx++;
                        if ( idx >= scope.messageArray.length ) idx = 0;
                        scope.currentScroller = scope.messageArray[ idx ];
                    } );

                }
            }
        } ]
);



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
                    "use strict";
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

app.directive( 'leftScroller', [
    '$log', '$timeout', '$window',
    function ( $log, $timeout, $window ) {
        return {
            restrict:    'E',
            scope:       {
                messageArray: '='
            },
            templateUrl: 'app/components/scroller/leftscroller.bud.template.html',
            link:        function ( scope, elem, attrs ) {

                var idx = 0;
                var leftPixel = $window.innerWidth + 20;
                var messageWidth = 0;
                var PIXELS_PER_FRAME = 4;
                var FPS = 30;
                var PIXELS_PER_CHAR = 7;

                var clen = 0;
                var lastLeft;

                function restart(){
                    scope.slider = { leftPos: $window.innerWidth};
                }

                function slide(){

                    scope.slider.leftPos-=PIXELS_PER_FRAME;
                    $log.info( "leftScroller: position " + scope.slider.leftPos );

                    if ( scope.slider.leftPos < ( -1*lastLeft)){
                        restart();
                    }

                    $timeout( slide, 1000/FPS );

                }

                function getWidth(){
                    var sliderWidth = document.getElementById( 'slider' ).clientWidth;
                    $log.debug("Slider div width: "+sliderWidth);

                    scope.messageArray.forEach( function(m){
                        clen+=m.length;
                    })

                    lastLeft = clen * PIXELS_PER_CHAR;
                    $log.debug("Char len: "+clen);


                }

                restart();
                $log.info("leftScroller: position "+scope.slider.leftPos);


                scope.$watch('messageArray', function(nval){

                    $log.debug("Message Array changed: "+nval);
                    getWidth();

                })

                slide();


            }
        }
    } ]
);
