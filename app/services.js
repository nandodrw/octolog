'use strict';

var octoblogServices = angular.module('octoblogServices', []);
octoblogServices.factory('githubService', ['$http','$q',function($http,$q) {

	var appConfg = {
		client_id : '4c644f97c8d114736503',
		client_secret : "450d19e3dcfb2193aa68e45a1c0d2f422c013185"
	};

	return {
		generateToken: function(user,pass){
			var deferred = $q.defer();
			var url_req = 'https://api.github.com/authorizations/clients/' + appConfg.client_id;
			var user_req = user + ':' + pass;
	    var buff = new Buffer(user_req);
	    var authorization = 'Basic ' + buff.toString('base64');
	    var data_req = {
	    	scopes : ['repo'],
	    	note : 'Get commit streaming and relate it with consulted resources',
	    	client_id : appConfg.client_id,
	    	client_secret : appConfg.client_secret
	    };
	    var myJSONText = JSON.stringify(data_req);
	    $http({method: 'PUT', url: url_req,headers : {'Authorization' : authorization},data: myJSONText}).
	    success(function(data, status, headers, config) {
	        deferred.resolve(data);
	    }).
	    error(function(data, status, headers, config) {
	       deferred.reject(data);
	    });
	    return deferred.promise;
		},

		getUserEvents: function(user,token,dataPage){
			var deferred = $q.defer();
			var url_req = 'https://api.github.com/users/' + user + '/events';
			var authorization = 'token ' + token;
			var params_req = {
	    	page : dataPage,
	    };
	    var myJSONText = JSON.stringify(params_req);
	    console.log(myJSONText);
			$http({method: 'GET', url: url_req,headers : {'Authorization' : authorization}, params : params_req}).
	    success(function(data, status, headers, config) {
	        var pageData = headers('Link').split(",");
	        var pageDataObj = {}
	        for (var i in pageData) {
	        	var key = pageData[i].substring(pageData[i].search('rel="') + 5,pageData[i].lastIndexOf('"'));
	        	var valueStr = pageData[i].substring(pageData[i].search('page=')+ 5,pageData[i].search('>;'));
	        	pageDataObj[key] = parseInt(valueStr);
	        };
	        window.parseData = data;
	        deferred.resolve(data,pageDataObj);
	    }).
	    error(function(data, status, headers, config) {
	       deferred.reject(data);
	    });
	    return deferred.promise;
		},

		getCommitsFromEvents: function(eventsObj){
			var deferred = $q.defer();
			var commitCollection = [];
			for(var i in eventsObj){
				// console.log('event',eventsObj[i]);
				if(eventsObj[i].type == "PushEvent"){
					var repo = {};
					repo.repoId = eventsObj[i].repo.id;
					repo.repoName = eventsObj[i].repo.name;
					// console.log('repo!',repo);
					for(var j in eventsObj[i].payload.commits){
						var commit = {};
						commit.repo = repo;
						commit.pushDate = eventsObj[i].created_at;
						commit.sha = eventsObj[i].payload.commits[j].sha;
						commit.message = eventsObj[i].payload.commits[j].message;
						console.log('commit',commit);
						commitCollection.push(commit);
					};
				};
			};
			deferred.resolve(commitCollection);
			return deferred.promise;
		}
	}
}]);

octoblogServices.factory('dataService',['$q',function($q){

	var localStorage = {};

	return {

		storeToken : function(user,token){
			var deferred = $q.defer();
			if(user && token){
				localStorage[user] = token
				deferred.resolve(localStorage);
			} else {
				deferred.reject('error!');
			}
			return deferred.promise;
		},

		getToken : function(){
			var deferred = $q.defer();
			if (localStorage[user]) {
				deferred.resolve(localStorage[user]);
			} else{
				deferred.reject('error!');
			}
			return deferred.promise;
		}
	};
}]);

octoblogServices.factory('sessionService',function(){
	return {
		currentUser : {
			name : "",
			token : ""
		}
	}
});


