'use strict';

var octoblogServices = angular.module('octoblogServices', []);

// interceptor for cath commits that are not aviable on gitHub
octoblogServices.config(['$httpProvider', function ($httpProvider) {

  var $http,
    interceptor = ['$q', '$injector', function ($q, $injector) {

        function success(response) {
            return response;
        }

        function error(response) {
          if (response.status === 404) {

            // get $http via $injector because of circular dependency problem
            $http = $http || $injector.get('$http');
            var defer = $q.defer();
            response.status = 200;
            response.data = {callError : "route no found"};
            defer.resolve(response);
            return defer.promise;// response;

          } else {
            return $q.reject(response);
          }
        }
        return function (promise) {
          return promise.then(success, error);
        }
    }];
  $httpProvider.responseInterceptors.push(interceptor);
}]);

octoblogServices.factory('githubService', ['$http','$q',function($http,$q) {

	var appConfg = {
		client_id : '4c644f97c8d114736503',
		client_secret : "450d19e3dcfb2193aa68e45a1c0d2f422c013185"
	};

	var transformEventData = function (eventsObj){
		var commitCollection = [];
		for(var i in eventsObj){
			if(eventsObj[i].type == "PushEvent"){
				var repo = {};
				repo = eventsObj[i].repo;
				for(var j in eventsObj[i].payload.commits){
					var commit = {};
					commit.repo = repo;
					commit.pushId = eventsObj[i].id;
					commit.pushDate = eventsObj[i].created_at;
					commit.sha = eventsObj[i].payload.commits[j].sha;
					commit.message = eventsObj[i].payload.commits[j].message;
					commitCollection.push(commit);
				};
			};
		};
		return commitCollection;
	};

	var getCommitDetail = function (token,sha,repo){
		var url_req = repo.url + '/commits/' + sha;
		var authorization = 'token ' + token;
		return $http({method: 'GET', url: url_req,headers : {'Authorization' : authorization}});
	};

	var truncateCommitsResult = function(commits,limitResult){
		var arr = [];
		for(var i in commits){
			if(i <= limitResult){
				arr.push(commits[i]);
			} else {
				break
			};
		};
		return arr;
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
			$http({method: 'GET', url: url_req,headers : {'Authorization' : authorization}, params : params_req}).
	    success(function(data, status, headers, config) {
	        var pageData = headers('Link').split(",");
	        var pageDataObj = {}
	        for (var i in pageData) {
	        	var key = pageData[i].substring(pageData[i].search('rel="') + 5,pageData[i].lastIndexOf('"'));
	        	var valueStr = pageData[i].substring(pageData[i].search('page=')+ 5,pageData[i].search('>;'));
	        	pageDataObj[key] = parseInt(valueStr);
	        };
	        deferred.resolve(data,pageDataObj);
	    }).
	    error(function(data, status, headers, config) {
	       deferred.reject(data);
	    });
	    return deferred.promise;
		},

		getCommitsFromEvents: function(token,eventsObj){
			var deferred = $q.defer();
			var commitCollection = transformEventData(eventsObj);
			var arrayPromises = [];
			for(var i in commitCollection){
				arrayPromises.push(getCommitDetail(token,commitCollection[i].sha,commitCollection[i].repo));
			};
			$q.all(arrayPromises).
			then(function(response){
				for(var i in response){
					if(!response[i].data.callError){
						commitCollection[i].date = response[i].data.committer.date;
						commitCollection[i].verify = response[i].data.sha == commitCollection[i].sha;
					} else {
						console.log('resource not found');
					}
				}
				deferred.resolve(commitCollection);
			},function(error){
				console.log('error :(',error);
				deferred.reject(error);
			});
			return deferred.promise;
		},

		//get all news commits that happend after the reference commit
		getNewestCommits : function(user,token,referenceCommit,acumulatedCommits){
			console.log('!!!!!!!!!!!!!!!!!one iteration!!!!!!!!!!!!!!!!');
			var deferred = $q.defer();
			var flagStop = false;
			var limitResult = 0;
			var that = this
			this.getUserEvents(user,token,1).
			then(function(events){
				return that.getCommitsFromEvents(token,events);
			}).
			then(function(commits){
				for(var i in commits){
					if(commits[i].sha == referenceCommit.sha && commits[i].pushId == referenceCommit.pushId){
						flagStop = true;
						limitResult = i;
						break;
					};
				}
				if(flagStop){
					commits = truncateCommitsResult(commits,limitResult);
					if(acumulatedCommits){
						commits = commits.concat(acumulatedCommits);
					};

					return commits;
				} else {
					return that.getNewestCommits(user,token,commits[commits.length -1]);
				};
			},function(err){
				console.log('error!')
			}).
			then(function(newestCommits){
				deferred.resolve(newestCommits);
			});
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


