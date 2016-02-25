/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "scrollerController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, $window ) {

        console.log( "Loading scrollerController" );

        $scope.messageArray = [ "Don't forget St. Patrick's at O'Flaherty's" ];

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
                appName:         "io.overplay.stpattys",
                endpoint:        "tv",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage,
                initialValue:    { messages: $scope.messageArray }
            } );

        }

        var logos = [
            //"assets/img/logo2016.png",
            "assets/img/Overplay_Logo_361_WHT.png",
            "assets/img/Overplay_Logo_368_WHT.png",
            "assets/img/Overplay_Logo_376_WHT.png",
            "assets/img/Overplay_Logo_7488_WHT.png",

        ];

        var lidx = 0;
        $scope.logo = "assets/img/oflahertys_logo2.png";

        updateFromRemote();

        /*
        $interval( function(){
            lidx++;
            if (lidx==logos.length) lidx=0;
            $scope.logo = logos[lidx];

        }, 3000);
        */

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

/**
 * Chumby does a shittly job of CSS transition scrolling, so we do it manually
 */
app.directive( 'cssScroller', [
        '$log', '$timeout', '$window',
        function ( $log, $timeout, $window ) {
            return {
                restrict:    'E',
                scope:       {
                    messageArray: '='
                },
                templateUrl: 'app/components/scroller/cssscroller.template.html',
                link:        function ( scope, elem, attrs ) {
                    "use strict";
                    var idx = 0;
                    var leftPixel = $window.innerWidth + 20;
                    var messageWidth = 0;
                    var PIXELS_PER_FRAME = 4;
                    var FPS = 30;

                    scope.message = { text: "", leftPos: leftPixel + 'px' };

                    scope.message.text = scope.messageArray[ idx ];


                    function setLeftPos() {
                        scope.message.leftPos = leftPixel + 'px';
                        $log.info( "LEFT POS: " + scope.message.leftPos );

                    }

                    function nextMsg() {
                        $log.info( "NEXT MESSAGE" );
                        idx++;
                        if ( idx == scope.messageArray.length ) idx = 0;
                        scope.message.text = scope.messageArray[ idx ];

                        messageWidth = scope.message.text.length * 40;

                        //$log.info( "NEXT MESSAGE: " + scope.message.text + " width: " + messageWidth );

                        leftPixel = $window.innerWidth + 20;
                        setLeftPos();
                        $timeout( scroll, 10 );
                    }


                    function scroll() {
                        leftPixel -= PIXELS_PER_FRAME;
                        setLeftPos();
                        if ( leftPixel < 0 ) {
                            nextMsg();

                        } else {
                            $timeout( scroll, 1000 / FPS );

                        }
                    }

                    $timeout( nextMsg, 20 );

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

app.directive( 'leftScrollerSp', [
    '$log', '$timeout', '$window',
    function ( $log, $timeout, $window ) {
        return {
            restrict:    'E',
            scope:       {
                messageArray: '=',
                logo: '='
            },
            templateUrl: 'app/components/scroller/leftscrollersp.template.html',
            link:        function ( scope, elem, attrs ) {

                var idx = 0;
                var leftPixel = $window.innerWidth + 20;
                var messageWidth = 0;
                var PIXELS_PER_FRAME = 4;
                var FPS = 30;
                var PIXELS_PER_CHAR = 14;

                var clen = 0;
                var lastLeft;

                var spd = new Date('3/17/2016');

                function updateTime(){

                    var delta = spd - new Date();
                    scope.timeToSP = Math.floor( (delta) / (1000 * 60 * 60 * 24) ) + " days to St. Patty's!";
                }

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
                    clen = 0;

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

                //$interval(updateTime, 15000);

            }
        }
    } ]
);
