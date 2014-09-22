'use strict';

angular.module('octolog', [
  'ngRoute',
  'octoblogServices',
  'octolog.login'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/login'});
}]);