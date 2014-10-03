'use strict';

angular.module('octolog.timeline', ['ngRoute','octoblogServices'])

.config(['$routeProvider',
  	function($routeProvider){
      $routeProvider.when('/testTimeline', {
        templateUrl: '_testTimeline/testTimeline.html',
        controller: 'testTimelineCtr'
      });
    }
  ]).

controller('timelineCtr',['sessionService','githubService','$scope','$interval',function(sessionService,githubService,$scope,$interval){

	refreshCommitsJob = $interval(function() {

	}, 5000);

	refreshCommitsJob.
	then(function(){
		console.log("looking for new commits")
	})


  $scope.stopRefrehCommits = function() {
    if (angular.isDefined(refreshCommitsJob)) {
      $interval.cancel(refreshCommitsJob);
      refreshCommitsJob = undefined;
    }
  };

}]);