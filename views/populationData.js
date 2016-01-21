'use strict';

angular.module('thisApp.populationData', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/population-data', {
    templateUrl: 'views/populationData.html'
  , controller: 'PopulationDataController'
  })
}])

.controller('PopulationDataController', function($scope, $location, Facets) {
  Facets.coeffs.retrieveData( function (data) {
    $scope.coeffs = data;
    $scope.$apply();
  });
});