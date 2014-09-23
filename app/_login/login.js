'use strict';

angular.module('octolog.login', ['ngRoute','octoblogServices'])

.config(['$routeProvider',
  	function($routeProvider){
      $routeProvider.when('/login', {
        templateUrl: '_login/login.html',
        controller: 'LoginCtrl'
      });
    }
  ])

.controller('LoginCtrl',
[
'$scope',
'$http',
'githubService',
'dataService',
'sessionService',
'$location',
function
  (
    $scope,
    $http,
    githubService,
    dataService,
    sessionService,
    $location
  )
{

  $scope.login = function(){

    githubService.generateToken($scope.user,$scope.pass).
    then(function(response){
      sessionService.currentUser.name = $scope.user;
      sessionService.currentUser.token = response.token;
      return dataService.storeToken($scope.user,response.token);
    },function(err){
      return false;
    }).
    then(function(response){
      console.log('nice!',response);
      $location.path('/timeline');
    },function(){
      console.log('err!!');
    });
  };
}]);


