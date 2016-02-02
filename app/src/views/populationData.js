'use strict';

angular.module('app.populationData', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/population-data', {
    templateUrl: 'src/views/populationData.html'
  , controller: 'PopulationDataController'
  })
}])

.controller('PopulationDataController', function($scope, $location, Facets) {
  Facets.coeffs.retrieveData( function (data) {
    $scope.coeffs = data;
    $scope.$apply();
  });
});