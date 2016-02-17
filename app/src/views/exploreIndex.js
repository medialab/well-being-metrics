'use strict';

angular.module('app.exploreIndex', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/explore-index', {
    templateUrl: 'src/views/exploreIndex.html',
    controller: 'ExploreIndexController'
  })
}])

.controller('ExploreIndexController', function (
  $scope,
  $location,
  $timeout,
  swbCategories,
  swbSeries,
  seriesMetadata,
  regionsMetadata,
  Facets,
  colors
) {
  $scope.colors = colors
  $scope.regions = d3.keys(regionsMetadata.USA.values)
  $scope.region = 'IL'
  $scope.regionsStatuses = {}
  $scope.regionsData = {}
  $scope.chartData
  $scope.seriesDomain = swbCategories.map(function (d) { return {topic: d, name: seriesMetadata.naming[d]} })
  $scope.seriesMeasure = swbSeries.map(   function (d) { return {topic: d, name: seriesMetadata.naming[d]} })
  $scope.topics = $scope.seriesDomain.concat($scope.seriesMeasure)
  $scope.topic = 'happiness'

  $scope.$watch('topic', function (newValue, oldValue, $scope) {
    if (newValue !== oldValue) {
      $scope.regions.forEach(function (region) {
        $scope.regionsStatuses[region] = {loading: true}
      })
      cascadeLoadRegions($scope.topic)
    }
  })

  $scope.$watch('region', function (newValue, oldValue, $scope) {
    if (newValue !== oldValue) {
      updateChartData()
    }
  })

  $scope.regions.forEach(function (region) {
    $scope.regionsStatuses[region] = {loading: true}
  })

  cascadeLoadRegions($scope.topic)

  $scope.setState = function (region) {
    $timeout(function () {
      $scope.region = region
      $scope.$apply()
    }, 0);
  }

  $scope.setTopic = function (topic) {
    $scope.topic = topic
  }

  $scope.unselectRegion = function () {
    console.log('UNSELECT')
    $scope.region = ''
  }

  $scope.regionName = function (r) {
    if (r === 'US') {
      return 'the United States'
    } else {
      return regionsMetadata.USA.values[r]
    }
  }

  function updateChartData() {
    $scope.chartData = $scope.regionsData[$scope.region]
  }

  function cascadeLoadRegions (serie) {
    if ( serie == $scope.topic ) {
      $scope.regions.some(function (region) {
        if ($scope.regionsStatuses[region].loading) {
          // Load region data
          var facet = Facets.getSeries('US', region, serie)
          if (facet) {
            facet.retrieveData(function (data) {
              if ( serie == $scope.topic ) {
                $timeout(function () {
                  $scope.regionsStatuses[region].loading = false
                  $scope.regionsStatuses[region].available = data !== undefined && data.length > 0
                  $scope.regionsData[region] = data
                  if (region == $scope.region) {
                    updateChartData()
                  }
                  cascadeLoadRegions(serie)
                  $scope.$apply()
                }, 0);
              }
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
  }


});