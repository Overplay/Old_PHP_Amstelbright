/**
 * Created by mkahn on 4/28/15.
 */



app.controller( "scrollerController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log ) {

        console.log( "Loading Tweeter scrollerController" );

        var API_KEY = "ZKGjeMcDZT3BwyhAtCgYtvrb5";
        var API_SECRET = "iXnv6zwFfvHzZr0Y8pvnEJM9hPT0mYV1HquNCzbPrGb5aHUAtk";
        var API_CONCAT = API_KEY + ':' + API_SECRET;
        var API_B64 = Base64.encode( API_CONCAT );
        var tweetSearchTerm = "future&q=pizza";
        var tweetSearchTerms = ["money", "kanye", "christmas"];
        var tweetAuth = false;

        $scope.tvinfo = undefined;
        $scope.updated = 0;

        function fetchTweets() {

            var query = "";
            for(var i = 0; i < tweetSearchTerms.length; i++){
                query += "q=" + tweetSearchTerms[i];
                if((i + 1) < tweetSearchTerms.length) query += "&";
            }
            query += " lang:en";

            cb.__call(
                "search_tweets",
                query,
                function ( reply, rate_limit_status ) {
                    console.log( rate_limit_status );
                    $scope.messageArray = [];

                    reply.statuses.forEach( function ( tweet ) {

                        $scope.messageArray.push( tweet.text );
                    } );

                    $scope.updated = new Date().getTime();
                    $scope.$apply();
                }
            );

        }

        var cb = new Codebird;
        cb.setConsumerKey( API_KEY, API_SECRET );

        cb.__call(
            "oauth2_token",
            {},
            function ( reply, err ) {
                var bearer_token;
                if ( err ) {
                    console.log( "error response or timeout exceeded" + err.error );
                }
                if ( reply ) {
                    bearer_token = reply.access_token;
                    cb.setBearerToken( bearer_token );
                    tweetAuth = true;
                    fetchTweets();
                }
            }
        );

        $scope.messageArray = [ "Tweet Board", "Hold on a sec, we're grabbing oh-so-important tweets from the interweb!" ];

        var logLead = "Tweeterer scrollerController: ";


        function modelUpdate( data ) {

            $log.info( logLead + " got a model update: " + angular.toJson( data ) );

            if(Array.isArray(data)) {
                tweetSearchTerms = data;
            }
        }

        function getTVInfo() {

            $http.get( "http://10.1.10.38:8080/tv/getTuned" )
                .then( function ( data ) {

                        $log.debug( "Got some info from DTV!" );

                        if ( !$scope.tvinfo || ($scope.tvinfo.callsign != data.data.callsign) ) {
                            $scope.tvinfo = data.data;

                            if ( $scope.tvinfo.callsign.indexOf( 'ESPN' ) > -1 ) {
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

        optvModel.init( {
            appName:      "io.overplay.tweeterer",
            endpoint:     "tv",
            dataCallback: modelUpdate,
            initialValue: $scope.messageArray
        } );


        $interval(getTVInfo, 1000);

        $interval( fetchTweets, 10000);

    } );

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
