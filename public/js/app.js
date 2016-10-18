var theApp = angular.module('mtweb3App', ['ui.bootstrap','ngSanitize','ui.select','pascalprecht.translate','ngMaterial','angularUtils.directives.dirPagination','angular-storage', 'angular-jwt','ngMessages', 'ngResource','ngStorage', 'ngRoute']);

theApp.run(function($rootScope, $location){

    //If the route change failed due to authentication error, redirect them out
    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection){
        if(rejection === 'Not Authenticated'){
            $location.path('/auth/login');
        }
    })
});