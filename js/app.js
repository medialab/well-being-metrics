'use strict';

// Declare app level module which depends on views, and components
angular.module('thisApp', [
  'ngRoute'
, 'angucomplete-alt'
, 'yaru22.directives.md' // Markdown renderer
, 'thisApp.services'
, 'thisApp.directives'
, 'thisApp.home'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/'});
}]);