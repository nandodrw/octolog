'use strict';

angular.module('octolog.login', ['ngRoute','satellizer'])

.config(['$routeProvider','$authProvider',
	function(
		$routeProvider,
		$authProvider
	){
  $routeProvider.when('/login', {
    templateUrl: '_login/login.html',
    controller: 'LoginCtrl'
  });

 	$authProvider.github({
    clientId: '4c644f97c8d114736503'
	});

}])

.controller('LoginCtrl', ['$scope','$auth',function($scope,$auth) {
	$scope.authenticate = function(provider) {
    $auth.authenticate(provider);
  };

}]);