/****************************************************************************

 File:       ngTweetScrape.js
 Function:   Provides an angular service wrapper for Twitter scraping
 Copyright:  Mitch Kahn
 Date:       2/17/2016
 Author:     mkahn

 ****************************************************************************/


angular.module( 'ngTweetScrape', [] )
    .factory( 'tweetScrape', function ( $http, $log, $timeout ) {

            var _apiKey, _apiSecret, _apiConcat, _apiB64;
            var _authorized = false;

            var service = { name: 'tweetScrape' };

            service.init = function ( initObj ) {

                _apiKey = initObj.apiKey;
                _apiSecret = initObj.apiSecret;
                _apiConcat = _apiKey + ':' + _apiSecret;
                _apiB64 = Base64.encode( _apiConcat );


            };

            service.authorize = function () {

                var req = {
                    method: "POST",
                    url: "https://api.twitter.com/oauth2/token",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                        "Authorization": "Basic "+_apiB64
                    },
                    data: { grant_type: "client_credentials" }
                }

                return $http( req )
                    .then( function ( data ) {

                            $log.info( "TweetScrape authorized ok" );
                            _authorized = true;
                            return true;
                        },
                        function ( err ) {

                            $log.error( "TweetScrape could not authorize" );
                            _authorized = false;
                            return false;

                        } );

            }

            return service;

        }
    )

