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

controller('timelineCtr',['sessionService','githubService','$scope',function(sessionService,githubService,$scope){

	$scope.user = sessionService.currentUser;

	githubService.getUserEvents($scope.user.name,$scope.user.token,2).
	then(function(response){
		$scope.commits = response;
	});

}]);