'use strict';

angular.module('octolog', [
  'ngRoute',
  'octoblogServices',
  'octolog.login',
  'octolog.timeline'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/login'});
}]);