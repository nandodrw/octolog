'use strict';

var octoblogServices = angular.module('octoblogServices', []);
octoblogServices.factory('githubService', ['$http','$q',function($http,$q) {
	var appConfg = {
		client_id : '4c644f97c8d114736503'
	};

	var that = this;

	return {
		generateToken: function(user,pass){
			var deferred = $q.defer();
			var url_req = 'https://api.github.com/authorizations';
			var user_req = user + ':' + pass;
	    var buff = new Buffer(user_req);
	    var authorization = 'Basic ' + buff.toString('base64');
	    var params_req = {
	    	scopes : ['repo'],
	    	note : "Get commit streaming and relate it with consulted resources",
	    	client_id : that.client_id
	    };
	    $http({method: 'POST', url: url_req,headers : {'Authorization' : authorization},params:params_req}).
	    success(function(data, status, headers, config) {
	        deferred.resolve(data);
	    }).
	    error(function(data, status, headers, config) {
	       deferred.reject(data);
	    });
	    return deferred;
		}
	}


}]);