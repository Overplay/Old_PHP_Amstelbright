/****************************************************************************

 File:       optvAPI.js
 Function:   Provides an angular service wrapper for inter-app communication
 Copyright:  Overplay TV
 Date:       10/14/15 5:16 PM
 Author:     mkahn

 This version does both Websockets and Polling

 ****************************************************************************/


angular.module( 'ngOpTVApi', [] )
    .factory( 'optvModel', function ( $http, $log, $timeout ) {

        //For HTTP version
        var POLL_INTERVAL_MS = 500;
        var apiPath = '';

        var service = { model: {} };

        service.apiPath = apiPath;

        //Callback for AppData updates
        var _dataCb;

        //Callback for new Message updates
        var _msgCb;

        var _appName;
        var _initialValue;

        //HTTP Mode stuff
        var appWatcher;
        var msgWatcher;
        
        var logLead= "optvAPI (" + _appName + "): ";
            
        function setInitialAppDataValueHTTP() {

            service.model = _initialValue;

            $http.post( apiPath + '/api/v1/appdata/index.php?appid=' + _appName, _initialValue )
                .then( function ( data ) {
                    $log.debug( logLead + " initial value POSTed via HTTP." )
                    startDataPolling();
                },
                function ( err ) {
                    //TODO add a callback for when shit is FUBAR
                    $log.error( logLead + " initial value POSTed via HTTP FAILED!!!! [FATAL]" )
                } );
        }
        
        function AppDataWatcher() {

            this.running = true;
            var _this = this;

            function updateIfChanged( data ) {

                if (! _.isEqual( service.model, data.payload ) ) {
                    service.model = data.payload;
                    _dataCb( service.model );
                }

            }

            this.poll = function () {

                $timeout( function () {

                    $http.get( apiPath + '/api/v1/appdata/index.php?appid=' + _appName )
                        .then( function ( data ) {
                            updateIfChanged( data.data );
                            if ( _this.running ) _this.poll();
                        },
                        function ( err ) {
                            $log.error( logLead + " couldn't poll model!" );
                            if ( _this.running ) _this.poll();
                        }
                    );

                }, POLL_INTERVAL_MS );
            }
        }

        function MessageWatcher() {

            //start NOW, not in the past like Data
            this.running = true;
            var _this = this;

            this.poll = function () {

                $timeout( function () {


                    $http.get( apiPath + '/api/v1/appmessage/index.php?appid=' + _msgAppId )
                        .then( function ( data ) {
                            var msgs = data.data;
                            //$log.info(logLead + "received inbound messages: " + data.data);
                            msgs.forEach( function ( msg ) {
                                //This dup should go away once we clean everything up
                                msg.message = msg.messageData;
                                _msgCb( msg );
                            } );
                            if ( _this.running ) _this.poll();
                        },
                        function ( err ) {
                            $log.error( logLead + " couldn't poll messages!" );
                            if ( _this.running ) _this.poll();
                        }
                    );

                }, POLL_INTERVAL_MS );

            }
        }

        function startDataPolling() {
            $log.info( logLead + " starting data polling." );
            appWatcher = new AppDataWatcher();
            appWatcher.poll();
        }

        /**
         * Must be run after clock sync
         */
        function initPhase2() {


            if ( _dataCb ) {

                $http.get( apiPath + '/api/v1/appdata/index.php?appid=' + _appName )
                    .then( function ( data ) {
                        $log.info( logLead + " model data (appData) already existed via http." );
                        if ( data.data.length == 0 ) {
                            setInitialAppDataValueHTTP();
                        } else {
                            service.model = data.data.payload;
                            _dataCb(service.model);
                            startDataPolling();
                        }
                    },
                    //Chumby browser doesn't seem to like "catch" in some places.
                    function ( err ) {
                        $log.info( logLead + " model data not in DB, creating via http" );
                        setInitialAppDataValueHTTP();
                    } );

                $log.debug( "optvAPI init app: " + _appName + " subscribing to data" );


            }

            if ( _msgCb ) {

                msgWatcher = new MessageWatcher();
                msgWatcher.poll();
            }

            service.postMessage({ data: { launchComplete: true }});

        }


        service.init = function ( params ) {

            _appName = params.appName;
            _msgAppId = _appName + '.' + ( params.endpoint || 'tv' );
            _dataCb = params.dataCallback;
            _msgCb = params.messageCallback;
            _initialValue = params.initialValue || {};

            $log.debug( "optvAPIPHP init for app: " + _appName );
            initPhase2();

        }

        service.save = function () {

            return $http.put( apiPath + '/api/v1/appdata/index.php?appid=' + _appName, service.model );

        };


        service.postMessage = function ( msg ) {

            var dest = msg.dest || "io.overplay.mainframe.tv";

            return $http.post( apiPath + '/api/v1/appmessage/index.php', {
                dest:        dest,
                src:        _msgAppId,
                messageData: msg.data
            } );

        };

        /**
         * Request app be moved between slots
         * @returns {promise that returns slot Id}
         */
        service.moveApp = function ( appid ) {

            //Passing nothing moves the app this API service is attached to
            appid = appid || _appName;
            return $http.post( apiPath + '/api/v1/overplayos/index.php?command=move&appid=' + appid );

        };

        /**
         * Request app be launched
         * @returns {promise}
         */
        service.launchApp = function ( appid ) {

            //Passing nothing moves the app this API service is attached to
            appid = appid || _appName;
            return $http.post( apiPath + '/api/v1/overplayos/index.php?command=launch&appid=' + appid );

        };

        /**
         * Request app be killed
         * @returns {promise}
         */
        service.killApp = function ( appid ) {

            //Passing nothing moves the app this API service is attached to
            appid = appid || _appName;
            return $http.post( apiPath + '/api/v1/overplayos/index.php?command=kill&appid=' + appid );

        };

        return service;

    }
)

