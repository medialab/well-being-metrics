'use strict';

angular.module('app.populationData', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/population-data', {
    templateUrl: 'src/views/populationData.html'
  , controller: 'PopulationDataController'
  })
}])

.controller('PopulationDataController', function($scope, $location, Facets, $mdSidenav, $timeout) {
	$scope.toggleLeft = buildDelayedToggler('left');

  Facets.coeffs.retrieveData( function (data) {
    $scope.coeffs = data;
    $scope.$apply();
  });

  $scope.close = function () {
    // Component lookup should always be available since we are not using `ng-if`
    $mdSidenav('left').close()
      .then(function () {
        // $log.debug("close LEFT is done");
      });
  };

  /**
   * Supplies a function that will continue to operate until the
   * time is up.
   */
  function debounce(func, wait, context) {
    var timer;
    return function debounced() {
      var context = $scope,
          args = Array.prototype.slice.call(arguments);
      $timeout.cancel(timer);
      timer = $timeout(function() {
        timer = undefined;
        func.apply(context, args);
      }, wait || 10);
    };
  }

  /**
   * Build handler to open/close a SideNav; when animation finishes
   * report completion in console
   */
  function buildDelayedToggler(navID) {
    return debounce(function() {
      // Component lookup should always be available since we are not using `ng-if`
      $mdSidenav(navID)
        .toggle()
        .then(function () {
          // $log.debug("toggle " + navID + " is done");
        });
    }, 200);
  }

})
