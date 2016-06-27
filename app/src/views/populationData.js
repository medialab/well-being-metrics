'use strict';

angular.module('app.populationData', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/population-data', {
    templateUrl: 'src/views/populationData.html'
  , controller: 'PopulationDataController'
  })
}])

.controller('PopulationDataController', function($scope, $location, Facets, $mdSidenav, $timeout) {
	var income_deciles = [1000, 1500, 2000, 2400, 2800, 3300, 3800, 4500, 5700]
	$scope.age = 18
	$scope.gender_list = [
		{label:'Male', value:'m'},
		{label:'Female', value:'f'}
	]
	$scope.gender
	$scope.income = (income_deciles[3] + income_deciles[4])/2
	$scope.incomeDecile = 3
	$scope.diploma_list = [
		{label:'Aucun diplôme', value:'none'},
		{label:'Diplôme professionnel', value:'pro'},
		{label:'Bac', value:'bac'},
		{label:'> Bac', value:'postbac'}
	]
	$scope.diploma
	$scope.french = false
	$scope.owner = false
	$scope.work_list = [
		{label:'Au travail', value:'worker'},
		{label:'Etudiant', value:'student'},
		{label:'Retraité', value:'retired'},
		{label:'Au foyer', value:'athome'},
		{label:'Au chomage', value:'unemployed'},
		{label:'Invalide', value:'disabled'}
	]
	$scope.work
	$scope.wedding_list = [
		{label:'Célibataire', value:'single'},
		{label:'En couple', value:'couple'},
		{label:'Divorcé vivant seul', value:'divorced'},
		{label:'Veuf vivant seul', value:'widow'}
	]
	$scope.wedding
	$scope.partnerWorks = false
	$scope.children_list = [
		{label:'Pas d\'enfant', value:'0'},
		{label:'1 enfant', value:'1'},
		{label:'2 enfants', value:'2'},
		{label:'3 enfants ou plus', value:'3'}
	]
	$scope.children
	$scope.charity = false
	

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
