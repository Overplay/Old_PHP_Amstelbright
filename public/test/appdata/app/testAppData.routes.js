/**
 * Created by mkahn on 1/16/16.
 */

/*********************************

 File:       testAppData.routes.js
 Function:   Routes
 Copyright:  AppDelegates LLC
 Date:       1/14/2016 2:55 PM
 Author:     mkahn

 Routes are fun.

 **********************************/

app.config( function ( $routeProvider ) {

     $routeProvider

        .when( '/:mode', {
            templateUrl: 'app/components/mainPage/mp.partial.html',
            controller:  'mainPageController'
        } )


        .otherwise( '/control' )
} );





