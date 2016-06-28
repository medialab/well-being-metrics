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

	$scope.modelVars = {}
	
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

  // Update happiness variables and models after user variables
  var userModelVars = ['gender', 'age', 'diploma', 'work', 'wedding', 'children', 'french', 'charity', 'incomeDecile', 'partnerWorks', 'owner']
  $scope.$watchGroup(userModelVars, updateHappinessModel)
  function updateHappinessModel () {
  	// Are variables filled?
  	$scope.incompleteModel = userModelVars.some(function(d){
  		return $scope[d] === undefined
  	})

		$scope.modelVars = {}
  	if (!$scope.incompleteModel) {
  		// Note: these have to match the coeffs
  		$scope.modelVars['age'] = $scope.age
  		$scope.modelVars['age-square'] = $scope.age * $scope.age
  		$scope.modelVars['age-cube'] = $scope.age * $scope.age * $scope.age
  		$scope.modelVars['is-woman'] = ($scope.gender == 'gender_female') ? (1) : (0)
  		$scope.modelVars['woman-by-age'] = $scope.modelVars['is-woman'] * $scope.modelVars['age']
  		$scope.modelVars['is-french'] = ($scope.french) ? (1) : (0)
  		$scope.modelVars['income-decile'] = $scope.incomeDecile
  		$scope.modelVars['income-decile-square'] = $scope.incomeDecile * $scope.incomeDecile
  		$scope.modelVars['is-owner'] = ($scope.owner) ? (1) : (0)
  		$scope.modelVars['partner-working'] = ($scope.partnerWorks) ? (1) : (0)
  		$scope.modelVars['has-children-1'] = ($scope.children == 'children_1') ? (1) : (0)
  		$scope.modelVars['has-children-2'] = ($scope.children == 'children_2') ? (1) : (0)
  		$scope.modelVars['has-children-3'] = ($scope.children == 'children_3') ? (1) : (0)
  		$scope.modelVars['is-working'] = ($scope.work == 'work_worker') ? (1) : (0)
  		$scope.modelVars['is-student'] = ($scope.work == 'work_student') ? (1) : (0)
  		$scope.modelVars['is-retired'] = ($scope.work == 'work_retired') ? (1) : (0)
  		$scope.modelVars['is-at-home'] = ($scope.work == 'work_athome') ? (1) : (0)
  		$scope.modelVars['has-dip-pro'] = ($scope.diploma == 'diploma_pro') ? (1) : (0)
  		$scope.modelVars['has-bac'] = ($scope.diploma == 'diploma_bac') ? (1) : (0)
  		$scope.modelVars['has-bac-plus'] = ($scope.diploma == 'diploma_postbac') ? (1) : (0)
  		$scope.modelVars['is-in-couple'] = ($scope.wedding == 'marital_couple') ? (1) : (0)
  		$scope.modelVars['is-divorced'] = ($scope.wedding == 'marital_divorced') ? (1) : (0)
  		$scope.modelVars['is-widow'] = ($scope.wedding == 'marital_widow') ? (1) : (0)
  		$scope.modelVars['has-children'] = ($scope.children && $scope.children != 'children_0') ? (1) : (0)
  		$scope.modelVars['partner-working-by-children'] = $scope.modelVars['partner-working'] * $scope.modelVars['has-children']
  		$scope.modelVars['at-home-by-children'] = $scope.modelVars['is-at-home'] * $scope.modelVars['has-children']
  		$scope.modelVars['woman-by-unemployed'] = $scope.modelVars['is-woman'] * (($scope.work == 'work_unemployed') ? (1) : (0))
  		$scope.modelVars['at-work-by-dip-pro'] = $scope.modelVars['is-working'] * $scope.modelVars['has-dip-pro']
  		$scope.modelVars['at-work-by-bac'] = $scope.modelVars['is-working'] * $scope.modelVars['has-bac']
  		$scope.modelVars['at-work-by-bac-plus'] = $scope.modelVars['is-working'] * $scope.modelVars['has-bac-plus']
  		$scope.modelVars['at-work-by-in-couple'] = $scope.modelVars['is-working'] * $scope.modelVars['is-in-couple']
  		$scope.modelVars['woman-by-in-couple'] = $scope.modelVars['is-woman'] * $scope.modelVars['is-in-couple']
  		$scope.modelVars['at-work-by-children'] = $scope.modelVars['is-working'] * $scope.modelVars['has-children']
  		$scope.modelVars['in-couple-by-children'] = $scope.modelVars['is-in-couple'] * $scope.modelVars['has-children']
  		$scope.modelVars['charity'] = ($scope.charity) ? (1) : (0)
  		$scope.modelVars['baseline'] = 1 // Constant
  	}
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
