'use strict';

angular.module('app.exploreIndex', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/explore-index', {
    templateUrl: 'src/views/exploreIndex.html'
  , controller: 'ExploreIndexController'
  })
}])

.controller('ExploreIndexController', function($scope, $location, $timeout, swbCategories, swbSeries, regionsMetadata, Facets) {
  $scope.regions = d3.keys(regionsMetadata.USA.values);
  $scope.topics = swbSeries;
  $scope.regionsStatuses = {}
  $scope.regionsData = {}

  $scope.regions.forEach(function (region) {
    $scope.regionsStatuses[region] = {loading: true}
  })

  cascadeLoadRegions('happiness')

  function cascadeLoadRegions(serie) {
    $scope.regions.some(function (region) {
      if ($scope.regionsStatuses[region].loading) {
        // Load region data
        var facet = Facets.getSeries('US', region, serie)
        if (facet) {
          facet.retrieveData(function (data) {
            $timeout(function () {
              $scope.regionsStatuses[region].loading = false
              $scope.regionsStatuses[region].available = data !== undefined && data.length > 0
              $scope.regionsData[region] = data
              cascadeLoadRegions(serie)
              $scope.$apply()
            }, 0);
          });
        } else {
          console.error('Cannot retrieve series\' facet', 'US', newValues[0], newValues[1]);
          $scope.regionsStatuses[region].loading = true
          $scope.regionsStatuses[region].available = false
          cascadeLoadRegions(serie)
        }
        return true
      }
      return false
    })
  }

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