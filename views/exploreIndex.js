'use strict';

angular.module('thisApp.exploreIndex', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/explore-index', {
    templateUrl: 'views/exploreIndex.html'
  , controller: 'ExploreIndexController'
  })
}])

.controller('ExploreIndexController', function($scope, $location, swbCategories, swbSeries, regionsMetadata, Facets) {
  $scope.regions = d3.keys(regionsMetadata.USA.values);
  $scope.topics = swbSeries;
  $scope.data

  $scope.$watchGroup(['regionSelect', 'topicSelect'], function (newValues, oldValues, $scope) {
    if (newValues[0] && newValues[1] && newValues[0] !== '' && newValues[1] !== '') {
      var facet = Facets.getSeries('US', newValues[0], newValues[1]);
      if (facet) {
        facet.retrieveData( function (data) {
          setTimeout(() => {
            $scope.data = data || 'NOT AVAILABLE';
            $scope.$apply();
          }, 0);
        });
      } else {
        console.error('Cannot retrieve series\' facet', 'US', newValues[0], newValues[1]);
      }
    }
  })
});