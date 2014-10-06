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

	// i know this key shouldn't be here, for production the method
	// used to get the token or the authenticaion should change
	var appConfg = {
		client_id : '4c644f97c8d114736503',
		client_secret : "450d19e3dcfb2193aa68e45a1c0d2f422c013185"
	};

	//help function to manipulate the data obteined from the GitHub
	//event API
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

	//get detail of a scpecift commit from GitHub API, retuns a promisse
	var getCommitDetail = function (token,sha,repo){
		var url_req = repo.url + '/commits/' + sha;
		var authorization = 'token ' + token;
		return $http({method: 'GET', url: url_req,headers : {'Authorization' : authorization}});
	};

	//helper function to that recive a list of commits and retuns a
	// a subset of that list. the LimitResult parameter determines the
	// subset's limit
	var truncateCommitsResult = function(commits,limitResult){
		var arr = [];
		for(var i in commits){
			if(i < limitResult){
				arr.push(commits[i]);
			} else {
				break
			};
		};
		return arr;
	};

	//public functions on the githubService service
	return {

		//get or create a token for the user
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

		//Get the list of event performed by the user while  interacting
		//whit github. The data page paremeter allows to call ans specific
		//page (300 max pages, according github pagination for the event API)
		//On the success scenario, the function also returns pagination information
		//object
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

		// since the list of event can return sha codes for commits (on push eventes)
		// but doesn't return any other aditional data about commits, the folloging function
		// is neccessary to get aditinal data for each commit
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
						// console.log('super important date',response[i]);
						commitCollection[i].date = response[i].data.commit.committer.date;
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
		// TODO: add security mechanisim if is not possible to link the last commit
		// aviable and all the commits accesible from the github event API (limited number of events are recorded)
		getNewestCommits : function(user,token,referenceCommit,lastPage,acumulatedCommits){
			if(!lastPage && lastPage != 0){
				var pageTostart  = 1;
			} else {
				var pageTostart  = lastPage + 1;
			}
			var deferred = $q.defer();
			var flagStop = false;
			var limitResult = 0;
			var that = this
			this.getUserEvents(user,token,pageTostart).
			then(function(events){
				return that.getCommitsFromEvents(token,events);
			}).
			then(function(commits){
				for(var i in commits){
					if((commits[i].sha == referenceCommit.sha) && (commits[i].pushId == referenceCommit.pushId)){
						flagStop = true;
						limitResult = i;
						break;
					};
				};
				if(flagStop){
					commits = truncateCommitsResult(commits,limitResult);
					if(acumulatedCommits){
						commits =	acumulatedCommits.concat(commits);
					};
					return commits;
				} else {
					if(acumulatedCommits){
						commits =	acumulatedCommits.concat(commits);
					};
					return that.getNewestCommits(user,token,referenceCommit,pageTostart,commits);
				};
			},function(err){
				console.log('error!')
			}).
			then(function(newestCommits){
				deferred.resolve(newestCommits);
			});
			return deferred.promise;
		},

		// get the list of commits performed by the user on a
		//specifict repo(repo reference is inside the referenceCommit parameter)
		//before a reference commit
		getCommitsFromRepo : function(user,token,referenceCommit){
			console.log('reference commit',referenceCommit);
			var deferred = $q.defer();
			var url_req = referenceCommit.repo.url + '/commits';
			var params_req = {
	    	author : user,
	    	until : referenceCommit.date
	    };
	    var authorization = 'token ' + token;
	    $http({method: 'GET', url: url_req,headers : {'Authorization' : authorization}, params : params_req}).
	    success(function(data){
	    	if(data.length > 1){
	    		var listCommits = [];
	    		for(var i in data){
		    		var aux = {};
		    		aux.date = data[i].commit.committer.date;
		    		aux.message = data[i].commit.message;
		    		aux.pushDate = undefined;
		    		aux.pushId = undefined;
		    		aux.repo = {
		    			id: undefined,
		    			name: data[i].url.substring(29,data[i].url.lastIndexOf('/commits/')),
		    			url: data[i].url.substring(0,data[i].url.lastIndexOf('/commits/'))
		    		};
		    		aux.sha = data[i].sha
		    		aux.verify = true;
		    		if(i > 0){listCommits.push(aux)};
		    	};
		    	deferred.resolve(listCommits);
	    	} else {
	    		deferred.resolve([]);
	    	};
	    }).
	    error(function(err){
	    	deferred.reject(err);
	    });
	    return deferred.promise;
		}
	}
}]);

octoblogServices.factory('infoManipulation',['$q',function($q){
	return {
		getReposFromCommits : function(commits){
			console.log('commits!',commits);
			var deferred = $q.defer();
			var hashRepos = {};
			var arrRepos = [];
			for (var i in commits){
				if(!hashRepos[commits[i].repo.name]){
					arrRepos.push({name : commits[i].repo.name});
					hashRepos[commits[i].repo.name] = true;
				}
			}
			deferred.resolve(arrRepos);
			return deferred.promise;
		}
	}
}]);

