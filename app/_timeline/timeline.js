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



	// githubService.getUserEvents($scope.user.name,$scope.user.token,4).
	// then(function(response){
	// 	// console.log('events object',response);
	// 	return githubService.getCommitsFromEvents($scope.user.token,response);
	// }).
	// then(function(data){
	// 	console.log('commits page 4',data,'largo',data.length);
	// 	$scope.commits = data;
	// 	return githubService.getNewestCommits($scope.user.name,$scope.user.token,data[0]);
	// }).
	// then(function(data){
	// 	console.log('newCommits',data,'largo',data.length);
	// },function(){
	// 	console.log('dead');
	// });

	// githubService.getUserEvents($scope.user.name,$scope.user.token,1).
	// then(function(data){
	// 	return githubService.getCommitsFromEvents($scope.user.token,data);
	// }).
	// then(function(data){
	// 	console.log('missing commits part1',data,'largo',data.length );
	// });

	// githubService.getUserEvents($scope.user.name,$scope.user.token,2).
	// then(function(data){
	// 	return githubService.getCommitsFromEvents($scope.user.token,data);
	// }).
	// then(function(data){
	// 	console.log('missing commits part2',data,'largo',data.length);
	// });

	// githubService.getUserEvents($scope.user.name,$scope.user.token,3).
	// then(function(data){
	// 	return githubService.getCommitsFromEvents($scope.user.token,data);
	// }).
	// then(function(data){
	// 	console.log('missing commits part3',data,'largo',data.length);
	// });

}]);