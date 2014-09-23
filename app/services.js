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
			// var url_req = 'https://api.github.com/authorizations'
			var user_req = user + ':' + pass;
	    var buff = new Buffer(user_req);
	    var authorization = 'Basic ' + buff.toString('base64');
	    var params_req = {
	    	scopes : ['repo'],
	    	note : 'Get commit streaming and relate it with consulted resources',
	    	client_id : appConfg.client_id,
	    	client_secret : appConfg.client_secret
	    };
	    var myJSONText = JSON.stringify(params_req);
	    $http({method: 'PUT', url: url_req,headers : {'Authorization' : authorization},data: myJSONText}).
	    success(function(data, status, headers, config) {
	        deferred.resolve(data);
	    }).
	    error(function(data, status, headers, config) {
	       deferred.reject(data);
	    });
	    return deferred.promise;
		},

		getUserEvents: function(user,token){
			var deferred = $q.defer();
			var url_req = 'https://api.github.com/users/' + user + '/events';
			var authorization = 'token ' + token;
			$http({method: 'GET', url: url_req,headers : {'Authorization' : authorization}}).
	    success(function(data, status, headers, config) {
	        deferred.resolve(data);
	    }).
	    error(function(data, status, headers, config) {
	       deferred.reject(data);
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


