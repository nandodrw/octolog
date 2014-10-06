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

controller('testTimelineCtr',['sessionService','githubService','dataService','infoManipulation','$scope','$interval',function(sessionService,githubService,dataService,infoManipulation,$scope,$interval){

  $scope.user = sessionService.currentUser;
  $scope.repos = [];
  $scope.commitList = [];
  window.a = $scope.commitList;

	var refreshCommitsJob = $interval(function() {
    console.log("happening!!");
	}, 5000);

	refreshCommitsJob.
	then(function(){
		console.log("looking for new commits");
	});


  // verify if we have data asiciated with the user,
  // if we don't, call get data from github API
  dataService.getRepos($scope.user.name).
  then(function(repos){
    if(repos.length > 0){
      $scope.repos = repos;
      return false
    } else {
      return githubService.getUserEvents($scope.user.name,$scope.user.token,1);
    }
  }).
  then(function(response){
    if(response){
      console.log('response1',response);
      return githubService.getCommitsFromEvents($scope.user.token,response);
    } else {
      return false
    }
  }).
  then(function(response){
    if(response){
      console.log('response2',response);
      dataService.storeCommits($scope.user.name,response).
      then(function(storedObjects){
        // some manipulation when the first commits of
        // a specifict user are stores in the database
      });
      return infoManipulation.getReposFromCommits(response);
    } else {
      return false
    }
  }).
  then(function(response){
    if(response){
      console.log('response3',response);
      return dataService.storeRepos($scope.user.name,response);
    } else {
      return false
    }
  }).
  then(function(response){
    if(response){
      console.log('response4',response);
      console.log('final response',response);
      $scope.repos = response;
    }
  });

  $scope.getCommits = function (repo){
    console.log('.-.',repo);
    dataService.getCommits($scope.user.name,repo.name).
    then(function(commits){
      console.log('commits from db',commits);
      $scope.commitList = commits;
    },function(err){
      console.log('error!',err);
    });
  };

}]);