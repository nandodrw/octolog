'use strict';

angular.module('octolog.timeline', ['ngRoute','octoblogServices'])

.config(['$routeProvider',
  	function($routeProvider){
      $routeProvider.when('/timeline', {
        templateUrl: '_timeline/timeline.html',
        controller: 'timelineCtr'
      });
    }
  ]).

controller('timelineCtr',['sessionService','githubService',function(sessionService,githubService){

	$scope.user = sessionService.currentUser;

	// githubService

	// $scope.commits =


}]);