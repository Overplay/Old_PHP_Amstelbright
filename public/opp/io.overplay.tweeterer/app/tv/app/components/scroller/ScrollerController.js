/**
 * Created by mkahn on 4/28/15.
 */

/**
 *
 *  Base64 encode / decode
 *  http://www.webtoolkit.info/
 *
 **/
var Base64 = {

    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function ( input ) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode( input );

        while ( i < input.length ) {

            chr1 = input.charCodeAt( i++ );
            chr2 = input.charCodeAt( i++ );
            chr3 = input.charCodeAt( i++ );

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if ( isNaN( chr2 ) ) {
                enc3 = enc4 = 64;
            } else if ( isNaN( chr3 ) ) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt( enc1 ) + this._keyStr.charAt( enc2 ) +
                this._keyStr.charAt( enc3 ) + this._keyStr.charAt( enc4 );

        }

        return output;
    },

    // public method for decoding
    decode: function ( input ) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace( /[^A-Za-z0-9\+\/\=]/g, "" );

        while ( i < input.length ) {

            enc1 = this._keyStr.indexOf( input.charAt( i++ ) );
            enc2 = this._keyStr.indexOf( input.charAt( i++ ) );
            enc3 = this._keyStr.indexOf( input.charAt( i++ ) );
            enc4 = this._keyStr.indexOf( input.charAt( i++ ) );

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode( chr1 );

            if ( enc3 != 64 ) {
                output = output + String.fromCharCode( chr2 );
            }
            if ( enc4 != 64 ) {
                output = output + String.fromCharCode( chr3 );
            }

        }

        output = Base64._utf8_decode( output );

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode: function ( string ) {
        string = string.replace( /\r\n/g, "\n" );
        var utftext = "";

        for ( var n = 0; n < string.length; n++ ) {

            var c = string.charCodeAt( n );

            if ( c < 128 ) {
                utftext += String.fromCharCode( c );
            }
            else if ( (c > 127) && (c < 2048) ) {
                utftext += String.fromCharCode( (c >> 6) | 192 );
                utftext += String.fromCharCode( (c & 63) | 128 );
            }
            else {
                utftext += String.fromCharCode( (c >> 12) | 224 );
                utftext += String.fromCharCode( ((c >> 6) & 63) | 128 );
                utftext += String.fromCharCode( (c & 63) | 128 );
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function ( utftext ) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt( i );

            if ( c < 128 ) {
                string += String.fromCharCode( c );
                i++;
            }
            else if ( (c > 191) && (c < 224) ) {
                c2 = utftext.charCodeAt( i + 1 );
                string += String.fromCharCode( ((c & 31) << 6) | (c2 & 63) );
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt( i + 1 );
                c3 = utftext.charCodeAt( i + 2 );
                string += String.fromCharCode( ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63) );
                i += 3;
            }

        }

        return string;
    }

}

app.controller( "scrollerController",
    function ( $scope, $timeout, $http, $interval, optvModel, $log ) {

        console.log( "Loading Tweeter scrollerController" );

        var API_KEY = "ZKGjeMcDZT3BwyhAtCgYtvrb5";
        var API_SECRET = "iXnv6zwFfvHzZr0Y8pvnEJM9hPT0mYV1HquNCzbPrGb5aHUAtk";
        var API_CONCAT = API_KEY + ':' + API_SECRET;
        var API_B64 = Base64.encode( API_CONCAT );

        function fetchTwats(){

            cb.__call(
                "search_tweets",
                "q=Iowa&New Hampshire",
                function ( reply, rate_limit_status ) {
                    console.log( rate_limit_status );
                    $scope.messageArray = [];

                    reply.statuses.forEach( function(twat){

                        $scope.messageArray.push(twat.text);
                    });
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
                    cb.setBearerToken(bearer_token);
                    fetchTwats();
                }
            }
        );

        $scope.messageArray = [ "Tweet Board",
            "Change messages in Control App!",
            "Enjoy Responsibly" ];

        var logLead = "BudBoard scrollerController: ";


        function modelUpdate( data ) {

            $log.info( logLead + " got a model update: " + angular.toJson( data ) );

        }

        optvModel.init( {
            appName:      "io.overplay.tweeterer",
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
