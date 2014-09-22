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

.controller('LoginCtrl', ['$scope','$http','githubService',function($scope,$http,githubService) {
  $scope.login = function(){

    octoblogServices.generateToken($scope.name,$scope.pass).
    then(function(response){
      console.log('nice',response);
    },function(err){
      console.log('error',err);
    });

  }
}]);


