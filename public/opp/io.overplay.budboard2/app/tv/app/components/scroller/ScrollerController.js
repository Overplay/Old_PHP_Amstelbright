/**
 * Created by mkahn on 4/28/15.
 */

app.controller( "scrollerController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log, tweetScrape ) {

        $log.info( "Loading scrollerController (BudBoard2)" );

        tweetScrape.init( {

            apiKey: "ZKGjeMcDZT3BwyhAtCgYtvrb5",
            apiSecret: "iXnv6zwFfvHzZr0Y8pvnEJM9hPT0mYV1HquNCzbPrGb5aHUAtk"

        });

        tweetScrape.authorize();

        var TWITTER = true;

        $scope.tvinfo = undefined;
        $scope.updated = 0;

        $scope.messageArray = [ "BudBoard from Budweiser", "The King of Beers", "Change your messages via Control App" ];

        var tweets = [];
        var localMessages = [];

        function logLead() { return "scrollerController: "; }

        function getTVInfo() {

            $http.get( "http://10.1.10.38:8080/tv/getTuned" )
                .then( function ( data ) {

                        $log.debug( "Got some info from DTV!" );

                        if ( !$scope.tvinfo || ($scope.tvinfo.callsign != data.data.callsign) ) {
                            $scope.tvinfo = data.data;

                            if ( $scope.tvinfo.callsign.indexOf( 'ES' ) > -1 ) {
                                optvModel.moveAppToSlot( 1 );
                                tweetSearchTerm = "ESPN";
                            } else {
                                optvModel.moveAppToSlot( 0 );
                                tweetSearchTerm = $scope.tvinfo.title;
                            }

                            $scope.messageArray = [ "Looks like you switched to " + $scope.tvinfo.callsign, "Hold on while I grab some tweetage!" ];
                            $scope.updated = new Date().getTime();

                            $timeout( fetchTweets, 15000 );

                        }


                    },
                    function ( err ) {

                        $log.error( "Could not contact DTV! Failing in silent agony" );

                    } );

        }

        function shuffle( o ) {
            var j, x, i;
            for ( i = o.length; i; i -= 1 ) {
                j = Math.floor( Math.random() * i );
                x = o[ i - 1 ];
                o[ i - 1 ] = o[ j ];
                o[ j ] = x;
            }

            return o;
        }


        function interleave() {

            $scope.messageArray = [];
            //lodash concat not working for some whacky reason
            tweets.forEach( function ( t ) { $scope.messageArray.push( t )} );
            localMessages.forEach( function ( t ) { $scope.messageArray.push( t )} );
            shuffle( $scope.messageArray );

        }

        function fetchTweets() {

            cb.__call(
                "search_tweets",
                "q=" + tweetSearchTerm + " lang:en",
                function ( reply, rate_limit_status ) {
                    console.log( "RL Status: " + angular.toJson(rate_limit_status, true) );
                    tweets = [];

                    if ( reply.statuses ) {

                        var statuses = reply.statuses.slice( 0, 5 );

                        statuses.forEach( function ( tweet ) {
                            tweets.push( tweet.text );
                        } );

                        $scope.updated = new Date().getTime();
                        interleave();
                        $scope.$apply();

                    }

                }
            );

        }



        function modelUpdate( data ) {

            $log.info( logLead() + " got a model update: " + angular.toJson( data ) );
            localMessages = data.messages;
            interleave();


        }

        function inboundMessage( msg ) {
            $log.debug( logLead() + "Inbound message..." );
        }

        function updateFromRemote() {

            optvModel.init( {
                appName:         "io.overplay.budboard2",
                endpoint:        "tv",
                dataCallback:    modelUpdate,
                messageCallback: inboundMessage,
                initialValue:    { messages: $scope.messageArray }
            } );

        }

        updateFromRemote();

        $interval( getTVInfo, 1000 );

        $interval( fetchTweets, 5 * 60 * 1000 );

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

                function restart() {
                    scope.slider = { leftPos: $window.innerWidth };
                }

                function slide() {

                    scope.slider.leftPos -= PIXELS_PER_FRAME;
                    //$log.info( "leftScroller: position " + scope.slider.leftPos );

                    if ( scope.slider.leftPos < ( -1 * lastLeft) ) {
                        restart();
                    }

                    $timeout( slide, 1000 / FPS );

                }

                function getWidth() {
                    var sliderWidth = document.getElementById( 'slider' ).clientWidth;
                    $log.debug( "Slider div width: " + sliderWidth );

                    clen = 0;

                    scope.messageArray.forEach( function ( m ) {
                        clen += m.length;
                    } )

                    lastLeft = clen * PIXELS_PER_CHAR;
                    $log.debug( "Char len: " + clen );


                }

                restart();
                $log.info( "leftScroller: position " + scope.slider.leftPos );


                scope.$watch( 'messageArray', function ( nval ) {

                    $log.debug( "Message Array changed: " + nval );
                    getWidth();

                } )

                slide();


            }
        }
    } ]
);
