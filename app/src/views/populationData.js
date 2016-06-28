'use strict';

angular.module('app.populationData', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/population-data', {
    templateUrl: 'src/views/populationData.html'
  , controller: 'PopulationDataController'
  })
}])

.controller('PopulationDataController', function(
	$scope,
	$location,
	Facets,
	$mdSidenav,
	$timeout,
	$translate,
	$translatePartialLoader
) {
	var income_deciles = [1000, 1500, 2000, 2400, 2800, 3300, 3800, 4500, 5700]
	var deciles_codes = [1,2,3,4,5,6,7,8,9,10].map(function(d){ return 'DECILE ' + d })
	$scope.age = 18
	var gender_codes = [
		'gender_male',
		'gender_female'
	]
	$scope.gender_list = []
	$scope.gender
	$scope.income = (income_deciles[3] + income_deciles[4])/2
	$scope.incomeDecile
	$scope.incomeDecileMessage_list = []
	$scope.incomeDecileMessage
	var diploma_codes = [
		'diploma_none',
		'diploma_pro',
		'diploma_bac',
		'diploma_postbac'
	]
	$scope.diploma_list = []
	$scope.diploma
	$scope.french = false
	$scope.owner = false
	var work_codes = [
		'work_worker',
		'work_student',
		'work_retired',
		'work_athome',
		'work_unemployed',
		'work_disabled'
	]
	$scope.work_list = []
	$scope.work
	var wedding_codes = [
		'marital_single',
		'marital_couple',
		'marital_divorced',
		'marital_widow'
	]
	$scope.wedding_list = []
	$scope.wedding
	$scope.partnerWorks = false
	var children_codes = [
		'children_0',
		'children_1',
		'children_2',
		'children_3'
	]
	$scope.children_list = []
	$scope.children
	$scope.charity = false
	
	$scope.toggleLeft = buildDelayedToggler('left');

	// Translation
  $translatePartialLoader.addPart('populationData');
  $translatePartialLoader.addPart('data');
  $translate.refresh();
  $timeout(function(){
  	$translate(gender_codes).then(function (translations) {
      $scope.gender_list = gender_codes.map(function(d){ return {value:d, label:translations[d]} })
    });
  	$translate(diploma_codes).then(function (translations) {
      $scope.diploma_list = diploma_codes.map(function(d){ return {value:d, label:translations[d]} })
    });
  	$translate(work_codes).then(function (translations) {
      $scope.work_list = work_codes.map(function(d){ return {value:d, label:translations[d]} })
    });
  	$translate(wedding_codes).then(function (translations) {
      $scope.wedding_list = wedding_codes.map(function(d){ return {value:d, label:translations[d]} })
    });
  	$translate(children_codes).then(function (translations) {
      $scope.children_list = children_codes.map(function(d){ return {value:d, label:translations[d]} })
    });
    $translate(deciles_codes).then(function (translations) {
      $scope.incomeDecileMessage_list = deciles_codes.map(function(d){ return translations[d] })
      updateDecileFromIncome()
    });
  })
  
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

  // Update income deciles after chosen income
  $scope.$watch('income', updateDecileFromIncome)
	updateDecileFromIncome()
  
  function updateDecileFromIncome() {
  	// Note: the deciles range from 1 to 10 as in statistics
  	$scope.incomeDecile = 1
  	income_deciles.forEach(function(max, i) {
  		if ($scope.income > max) {
  			$scope.incomeDecile = i+2
  		}
  	})
  	$scope.incomeDecileMessage = $scope.incomeDecileMessage_list[$scope.incomeDecile - 1]
  }

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
