/*********************************

 File:       MainFrameController.js
 Function:   Controller for MainFrame
 Copyright:  Overplay TV
 Date:       10/14/15 5:35 PM
 Author:     mkahn

 Pretty much does everything for Mainframe since all it does is sequence iframes.

 **********************************/


app.controller( "mainFrameController", function ( $scope, $timeout, $location, $log, $rootScope, $http, $window, optvModel, osService, $interval ) {

        $log.info( "Loading mainFrameController" );
        $log.info( "osService SERVICE: " + osService.name );

        $scope.launcher = { app: undefined, show: false };

        $scope.os = osService;

        $scope.clientApps = osService.runningApps;
        $scope.runningApps = [];

        //New layout technique...
        $scope.runningAppSrc = [];
        $scope.runningAppPos = [];

        $scope.ui = { open: true, debug: false, fauxTV: false, loadingApp: false, hideall: true, showPOL: false };

        var logLead = "MFController: ";


        // For on-Mac testing
        $scope.keyPressed = function ( event ) {

            $log.info( "Keyboard button pressed: " + event.which );

        }


        function showAppPicker( shouldShow ) {

            $scope.launcher.show = shouldShow;

        }

        function toggleAppPicker() {

            $scope.launcher.show = !$scope.launcher.show;
            $log.debug(logLead+" toggleing app picker");
            $interval(function(){
                showPOL( true );
                $timeout( function(){
                    showPOL(false);
                }, 500);

            }, 30000);

            if (!$scope.launcher.show){
                layoutAndShow();
            }

        }

        function showApps( shouldShow ) {

            $scope.launcher.show = !shouldShow;

        }

        //Proof of life popup...
        function showPOL( shouldShow ){

            $log.debug(logLead+" showingPOL: "+shouldShow);

           if ( shouldShow ){
                $scope.ui.showPOL = true;
            } else {
                $scope.ui.showPOL = false;
            }
        }

        // This call is used from outside Angular, requires $apply
        $scope.buttonPushed = function ( netvButton ) {
            $scope.$apply( function () {
                buttonPushed( netvButton );
            } )
        }

        // Called from inside Angular by messages simulating IR remote
        //
        // Buttons are: 'widget', 'cpanel', 'up', 'down', 'left', 'right', 'center'
        //
        function buttonPushed( netvButton ) {

            $log.info( "NeTV remote pressed: " + netvButton );
            switch ( netvButton ) {
                case 'widget':
                    $log.info( "Widget button pressed" );
                    toggleAppPicker();
                    break;

                case 'left':
                case 'right':
                case 'center':
                case 'cpanel':
                case 'up':
                case 'down':
                    //Relay everything other than show/hide picker to the picker
                    optvModel.postMessage( { dest: "io.overplay.apppicker.tv", data: { remote: netvButton } } );
                    break;
                default:
                    break;

            }

        }

        /*
         Move messages need to be like this for now:
         { "dest":"io.overplay.mainframe", "from":"io.overplay.shuffleboard", "data":{ "move": { "spot" : "tl" }}}
         */
        function mergeApps( inboundData ) {

            $scope.runningAppSrc = _.pluck( inboundData, 'src' );
            $scope.runningAppPos = _.pluck( inboundData, 'location' );

        }

        function layoutAndShow() {

            osService.getApps()
                .then( function ( data ) {
                    $scope.runningApps = data;
                    mergeApps( data );
                }, function ( err ) {
                    $log.error( logLead + " error fetching AppMap. Error: " + angular.toJson( err ) );
                } );

            //Give the app picker some time to hide
            $timeout( function () {
                $log.debug( "Delayed show of apps" );
                showApps( true );
            }, 1250 );

        }

        function inboundMessageMain( m ) {

            $log.info( "Mainframe received message: " + angular.toJson( m ) );
            $scope.lastMessage = angular.toJson( m );


            if ( m.message && m.message.layout ) {

                $log.info( logLead + "received LAYOUT message" );
                layoutAndShow();

            }

            if ( m.message && m.message.launch ) {

                $log.info( logLead + "received LAUNCH message" );
                $scope.ui.loadingApp = true;

            }

            if ( m.message && m.message.launchComplete ) {

                $log.info( logLead + "received LAUNCH COMPLETE message" );
                $scope.ui.loadingApp = false;

            }

            //Show Dash
            if ( m.message && m.message.dash ) {

                switch ( m.message.dash ) {

                    case 'show':
                        showApps( false );
                        $timeout( function () { showAppPicker( true ); }, 1500 );
                        break;

                    case 'hide':
                        //showAppPicker( false );
                        //$timeout( function () { showApps( true ); }, 1500 );
                        layoutAndShow();
                        break;

                    case 'toggle':
                        //TODO sequencing
                        toggleAppPicker();
                        break;

                }
            }

            //Show Dash
            if ( m.message && m.message.debug ) {

                switch ( m.message.debug ) {

                    case 'toggle':
                        $scope.ui.debug = !$scope.ui.debug;
                        break;

                }
            }

            //Show FauxTV
            if ( m.message && m.message.fauxtv ) {

                switch ( m.message.fauxtv ) {

                    case 'toggle':
                        $scope.ui.fauxTV = !$scope.ui.fauxTV;
                        break;

                }
            }

            //TODO this should be a case statement
            //Show Dash
            if ( m.message && m.message.remote ) {

                switch ( m.message.remote ) {

                    case 'up':
                        buttonPushed( 'up' );
                        break;

                    case 'down':
                        buttonPushed( 'down' );
                        break;

                    case 'select':
                        buttonPushed( 'center' );
                        break;

                }
            }

        }

        optvModel.init( {
            appName:         "io.overplay.mainframe",
            endpoint:        "tv",
            messageCallback: inboundMessageMain
        } );

        function setLauncher( app ) {
            $scope.launcher.app = app;
            showAppPicker( true );
        }

        //CATCH specifically not used for older JS
        osService.getLauncher()
            .then( setLauncher,
            function ( err ) {
                $log.error( "MFController: major error, no app launcher!! " + err );
            } );


        //Harmless, but also did not get rid of black box on boot
        $timeout( function () { $scope.ui.hideall = false; }, 3000 );

        $timeout( function () { toggleAppPicker(); }, 25000 );


    }
)
;

