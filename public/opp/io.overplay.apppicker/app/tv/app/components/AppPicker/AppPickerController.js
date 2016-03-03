/**
 *
 * ROOT CONTROLLER FOR APP PICKER
 *
 *
 */


app.controller("appPickerController", function ($scope, $log, $rootScope, $http, optvModel) {

    console.log("appPickerController rootController");

    //On/off screen animations handled by Mainframe
    //$scope.ui = {onscreen: false};

    var _selectedIcon = 0;
    var logLead = "appPickerController: ";

    $scope.system = { ip: '-'};

    $http.get('/api/v1/overplayos/index.php?command=hostip')
        .then( function(data){

            $scope.system.ip = data.data.ip;

        }, function(err){
            $scope.system.ip = "error";
        });

    $scope.logoColor = "#62B946";

    $scope.keyPressed = function (event) {

        console.log("Key pressed: " + event.which);
        //toggleUI();
    }

    $scope.buttonPushed = function (netvButton) {

        /*
         Buttons are: 'widget', 'cpanel', 'up', 'down', 'left', 'right', 'center'
         */
        $log.info("Message received saying NeTV remote pressed: " + netvButton);


        switch (netvButton) {

            case 'widget':
                //toggleUI();
                break;

            case 'up':
            case 'left':
                _selectedIcon--;
                if (_selectedIcon < 0) _selectedIcon = $scope.apps.length - 1;
                break;

            case 'down':
            case 'right':
                _selectedIcon++;
                if (_selectedIcon == $scope.apps.length) _selectedIcon = 0;
                break;

            case 'center':
                $log.info("Center pushed. Go to: " + $scope.apps[_selectedIcon].reverseDomainName);
                //toggleUI();
                $scope.clicked($scope.apps[_selectedIcon]);
                break;

            case 'cpanel':
                $rootScope.$broadcast('CPANEL');
                break;

            default:
                break;


        }



    }

    $scope.isSelected = function (idx) {
        return idx == _selectedIcon;
    }


    //Get all the apps to show on AppPicker
    $http.get( optvModel.apiPath + '/api/v1/apps?command=userapps')
        .then(function (data) {
                  $scope.apps = data.data;
              })

    $scope.launcherIconPath = function(app){

        return '../../../'+app.reverseDomainName+'/assets/icons/'+app.iconLauncher;
    }

    $scope.clicked = function (app) {
        $log.info("Clicked on: " + app.reverseDomainName);
        optvModel.launchApp( app.reverseDomainName );

    };

    function inboundMessage(msg) {
        $log.info("Inbound message..to APPPICKER");
        $log.info(JSON.stringify(msg));
        if (msg.message.remote){
            $scope.buttonPushed(msg.message.remote);
        }
    }

    optvModel.init({
        appName: "io.overplay.apppicker",
        endpoint: "tv",
        messageCallback: inboundMessage
    });


});

