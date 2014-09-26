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
		// console.log('events object',response);
		return githubService.getCommitsFromEvents($scope.user.token,response);
	}).
	then(function(data){
		console.log('commits page 2',data);
		$scope.commits = data;
		return githubService.getNewestCommits($scope.user.name,$scope.user.token,data[0]);
	}).
	then(function(data){
		console.log('newCommits',data);
	},function(){
		console.log('dead');
	});

	githubService.getUserEvents($scope.user.name,$scope.user.token,1).
	then(function(data){
		return githubService.getCommitsFromEvents($scope.user.token,data);
	}).
	then(function(data){
		console.log('missing commits',data);
	});

	// githubService.getUserEvents($scope.user.name,$scope.user.token,2).
	// then(function(response){
	// 	console.log('events object',response);
	// 	return githubService.getCommitsFromEvents($scope.user.token,response);
	// }).
	// then(function(data){
	// 	console.log('commits',data);
	// 	$scope.commits = data;
	// 	// return githubService.getNewestCommits($scope.user.name,$scope.user.token,data[0]);
	// });


}]);