'use strict';

angular.module('octolog', [
  'ngRoute',
  'octolog.login'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/login'});
}]);