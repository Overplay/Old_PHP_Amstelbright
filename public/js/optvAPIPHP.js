/****************************************************************************

 File:       optvAPI.js
 Function:   Provides an angular service wrapper for inter-app communication
 Copyright:  Overplay TV
 Date:       10/14/15 5:16 PM
 Author:     mkahn

 This version does both Websockets and Polling

 ****************************************************************************/


angular.module( 'ngOpTVApi', [] )
    .factory( 'optvModel', function ( $http, $log, $interval, $rootScope, $q, $timeout ) {

        //For HTTP version
        var POLL_INTERVAL_MS = 100;
        var DEFAULT_METHOD = 'http';
        //var apiPath = '/overplay/amstelbright/public';

        var apiPath = '';

        var service = { model: {} };

        service.apiPath = apiPath;

        //Callback for AppData updates
        var _dataCb;

        //Callback for new Message updates
        var _msgCb;

        var _appName;
        var _dbId;
        var _initialValue;
        var _netMethod;

        //HTTP Mode stuff
        var appWatcher;
        var msgWatcher;

        //since NeTV can't tell time right and usually comes up in 2011
        //This is ms ahead/behind for the local Chumby clock.
        var _osTimeDifferential;

        function getCurrentOSTime() {

            return new Date().getTime() + _osTimeDifferential;

        }

        function logLead() {
            var ll = "optvAPI (" + _appName + "): ";
            return ll;
        }


        function setInitialAppDataValueHTTP() {

            service.model = _initialValue;

            //Don't post up an undefined. We are probably in an app that doesn't set defaults.
            if ( !_initialValue )
                return;

            $http.post( apiPath+ '/api/v1/appdata/index.php?appid', _initialValue )
                .then( function ( data ) {
                    $log.debug( logLead() + " initial value POSTed via HTTP." )
                },
                function ( err ) {
                    $log.debug( logLead() + " initial value POSTed via HTTP FAILED!!!!" )
                } );

        }


        function AppDataWatcher() {

            this.lastUpdated = new Date( 0 );
            this.running = true;

            var _this = this;

            function updateIfNewer( data ) {

                //$log.info( logLead() + " Checking if inbound data is newer" );
                //TODO this isn't work right on chumby

                var mtime = new Date( parseInt(data.lastUpdated) );
                var newer = mtime > _this.lastUpdated;

                if ( newer ) {
                    _this.lastUpdated = mtime;
                    service.model = data.data.data;
                    _dataCb( service.model );
                }

            }

            //TODO this should run a query filter on modTime and not do it in code above
            this.poll = function () {

                $timeout( function () {

                    $http.get( apiPath +'/api/v1/appdata/index.php?appid=' + _appName )
                        .then( function ( data ) {
                            updateIfNewer( data.data );
                            if ( _this.running ) _this.poll();
                        },
                        function ( err ) {
                            $log.error( logLead() + " couldn't poll model!" );
                            if ( _this.running ) _this.poll();
                        }
                    );

                }, POLL_INTERVAL_MS );

            }
        }

        function MessageWatcher() {

            //start NOW, not in the past like Data
            this.lastUpdated = getCurrentOSTime();
            this.running = true;

            var _this = this;

            function updateIfNewer( data ) {

                if ( new Date( data.lastUpdated ) > _this.lastUpdated ) {
                    service.model = data.data;
                    _dataCb( service.model );
                }

            }

            this.poll = function () {

                $timeout( function () {


                    $http.get( apiPath +'/api/v1/appmessage/index.php?appid=' + _appName )
                        .then( function ( data ) {
                            var msgs = data.data;
                            //$log.info(logLead() + "received inbound messages: " + data.data);
                            msgs.forEach( function ( msg ) {
                                //This dup should go away once we clean everything up
                                msg.message = msg.messageData;
                                _msgCb( msg );
                            } );
                            if ( _this.running ) _this.poll();
                        },
                        function ( err ) {
                            $log.error( logLead() + " couldn't poll messages!" );
                            if ( _this.running ) _this.poll();
                        }
                    );

                }, POLL_INTERVAL_MS );

            }
        }


        /**
         * Must be run after clock sync
         */
        function initPhase2() {


            if ( _dataCb ) {

                $http.get( apiPath +'/api/v1/appdata/index.php?appid=' + _appName )
                    .then( function ( data ) {
                        $log.info( logLead() + " model data (appData) already existed via http." );
                        if ( data.data.length == 0 ) {
                            setInitialAppDataValueHTTP();
                        } else {
                            service.model = data.data;
                        }
                    },
                    //Chumby browser doesn't seem to like "catch" in some places.
                    function ( err ) {
                        $log.info( logLead() + " model data not in DB, creating via http" );
                        setInitialAppDataValueHTTP();
                    } );

                $log.debug( "optvAPI init app: " + _appName + " subscribing to data" );

                appWatcher = new AppDataWatcher();
                appWatcher.poll();
            }

            if ( _msgCb ) {

                msgWatcher = new MessageWatcher();
                msgWatcher.poll();
            }


        }


        service.init = function ( params ) {

            _appName = params.appName;
            _dataCb = params.dataCallback;
            _msgCb = params.messageCallback;
            _initialValue = params.initialValue || undefined;
            _netMethod = params.netMethod || DEFAULT_METHOD;

            $log.debug( "optvAPIPHP init for app: " + _appName );

            //Have to use the old then() signature for Chumby browser
            //Synching must be done before any other init...
            $http.get( apiPath +'/api/v1/overplayos/index.php?command=ostime' )
                .then( function ( data ) {
                    var myJson = angular.toJson( data );
                    $log.debug( logLead() + " got this for time from OS server " + myJson );
                    var localTime = new Date().getTime();
                    var osTime = new Date( parseInt(data.data.msdate) );
                    _osTimeDifferential = osTime - localTime;
                    $log.debug( logLead() + " got new OS time diff of: " + _osTimeDifferential );
                    $log.debug( logLead() + " my local ms time is: " + new Date().getTime() );
                    initPhase2();

                },
                function ( err ) {
                    _osTimeDifferential = new Date( '11-01-2015' ).getTime() - new Date().getTime();
                    $log.debug( logLead() + " failed to get to OStime, setting to somthing close: " + _osTimeDifferential );
                    initPhase2();

                } );


        }

        service.save = function () {

            return $http.put( apiPath +'/api/v1/appdata/index.php?appid=' + _appName, { data: service.model } );


        };


        service.postMessage = function ( msg ) {


            //TODO remove 'to' throughout all apps...for now just or it.
            var dest = msg.dest || msg.to || "io.overplay.mainframe";

            return $http.post( apiPath +'/api/v1/appmessage/index.php', { dest: dest, from: _appName, messageData: msg.data } );


        };

        /**
         * Request app be moved between slots
         * @returns {promise that returns slot Id}
         */
        service.moveApp = function ( appid ) {

            //Passing nothing moves the app this API service is attached to
            appid = appid || _appName;
            return $http.post( apiPath +'/api/v1/overplayos/index.php?command=move?appid=' + appid );

        };

        /**
         * Request app be launched
         * @returns {promise}
         */
        service.launchApp = function ( appid ) {

            //Passing nothing moves the app this API service is attached to
            appid = appid || _appName;
            return $http.post( apiPath +'/api/v1/overplayos/index.php?command=launch&appid=' + appid );

        };

        /**
         * Request app be killed
         * @returns {promise}
         */
        service.killApp = function ( appid ) {

            //Passing nothing moves the app this API service is attached to
            appid = appid || _appName;
            return $http.post( apiPath +'/api/v1/overplayos/index.php?command=kill&appid=' + appid );

        };


        return service;

    }
)

