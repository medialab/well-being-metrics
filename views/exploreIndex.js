'use strict';

angular.module('thisApp.exploreIndex', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/explore-index', {
    templateUrl: 'views/exploreIndex.html'
  , controller: 'ExploreIndexController'
  })
}])

.controller('ExploreIndexController', function($scope, $location) {
  
});