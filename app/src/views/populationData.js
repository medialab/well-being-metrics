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
	$scope.presets = [
		// First names found via https://dataaddict.fr/prenoms
		{
			id: 'student',
			type: 'STUDENT',
			text: 'STUDENT TEXT',
			name: 'Camille',
			color: '#64dac4',
			colorLight: '#c8f4ea',
			data: {
				'age': 19,
				'work': 'work_student',
				'income': 4000, // Income decile: 8 (lives at home)
				'diploma': 'diploma_bac',
				'owner': true, // lives at home
				'wedding': 'marital_single',
				'children': 'children_0',
				'charity': false,
				'french': true
			}
		},
		{
			id: 'young-single',
			type: 'YOUNG SINGLE',
			text: 'YOUNG SINGLE TEXT',
			name: 'Julien',
			color: '#da81ac',
			colorLight: '#e3d6e9',
			data: {
				'gender': 'gender_male',
				'age': 30,
				'work': 'work_worker',
				'income': 2200, // Income decile: 4
				'diploma': 'diploma_pro',
				'owner': false,
				'wedding': 'marital_single',
				'children': 'children_0',
				'charity': false,
				'french': true
			}
		},
		{
			id: 'young-active-mom',
			type: 'YOUNG ACTIVE MOM',
			text: 'YOUNG ACTIVE MOM TEXT',
			name: 'Elodie',
			color: '#75d189',
			colorLight: '#bed9b3',
			data: {
				'gender': 'gender_female',
				'age': 25,
				'work': 'work_worker',
				'income': 3500, // Income decile: 7
				'diploma': 'diploma_none',
				'owner': true,
				'wedding': 'marital_couple',
				'children': 'children_2',
				'partnerWorks': true,
				'charity': false,
				'french': true
			}
		},
		{
			id: 'comfortable-father',
			type: 'COMFORTABLE FATHER',
			text: 'COMFORTABLE FATHER TEXT',
			name: 'Frédéric',
			color: '#c494d8',
			colorLight: '#e2c9f0',
			data: {
				'gender': 'gender_male',
				'age': 40,
				'work': 'work_worker',
				'income': 4000, // Income decile: 8
				'diploma': 'diploma_postbac',
				'owner': true,
				'wedding': 'marital_couple',
				'children': 'children_2',
				'partnerWorks': true,
				'charity': false,
				'french': true
			}
		},
		{
			id: 'modest-father',
			type: 'MODEST FATHER',
			text: 'MODEST FATHER TEXT',
			name: 'Jérôme',
			color: '#779d53',
			colorLight: '#d7f3cc',
			data: {
				'gender': 'gender_male',
				'age': 40,
				'work': 'work_worker',
				'income': 1800, // Income decile: 3
				'diploma': 'diploma_pro',
				'owner': false,
				'wedding': 'marital_couple',
				'children': 'children_2',
				'partnerWorks': false,
				'charity': false,
				'french': true
			}
		},
		{
			id: 'single-mother',
			type: 'SINGLE MOTHER',
			text: 'SINGLE MOTHER TEXT',
			name: 'Virginie',
			color: '#789ae0',
			colorLight: '#c1d3ef',
			data: {
				'gender': 'gender_female',
				'age': 35,
				'work': 'work_worker',
				'income': 1800, // Income decile: 3
				'diploma': 'diploma_pro',
				'owner': false,
				'wedding': 'marital_single',
				'children': 'children_1',
				'charity': false,
				'french': true
			}
		},
		{
			id: 'mother-at-home',
			type: 'MOTHER AT HOME',
			text: 'MOTHER AT HOME TEXT',
			name: 'Aurélie',
			color: '#b9ac5e',
			colorLight: '#e6d9bc',
			data: {
				'gender': 'gender_female',
				'age': 35,
				'work': 'work_athome',
				'income': 2200, // Income decile: 4
				'diploma': 'diploma_pro',
				'owner': false,
				'wedding': 'marital_couple',
				'children': 'children_3',
				'partnerWorks': true,
				'charity': false,
				'french': true
			}
		},
		{
			id: 'longterm-unemployed-woman',
			type: 'UNEMPLOYED WOMAN',
			text: 'UNEMPLOYED WOMAN TEXT',
			name: 'Stéphanie',
			color: '#54bada',
			colorLight: '#b8d7e0',
			data: {
				'gender': 'gender_female',
				'age': 40,
				'work': 'work_unemployed',
				'income': 2600, // Income decile: 5
				'diploma': 'diploma_pro',
				'owner': false,
				'wedding': 'marital_couple',
				'children': 'children_1',
				'partnerWorks': true,
				'charity': false,
				'french': true
			}
		},
		{
			id: 'single-unemployed-man',
			type: 'SINGLE UNEMPLOYED MAN',
			text: 'SINGLE UNEMPLOYED MAN TEXT',
			name: 'Jérémy',
			color: '#d4985d',
			colorLight: '#eccbb4',
			data: {
				'gender': 'gender_male',
				'age': 30,
				'work': 'work_unemployed',
				'income': 1300, // Income decile: 2
				'diploma': 'diploma_pro',
				'owner': false,
				'wedding': 'marital_single',
				'children': 'children_0',
				'charity': false,
				'french': true
			}
		},
		{
			id: 'active-citizen',
			type: 'ACTIVE CITIZEN',
			text: 'ACTIVE CITIZEN TEXT',
			name: 'Stéphan(i)e',
			color: '#41aaa1',
			colorLight: '#a7d2c9',
			data: {
				'age': 45,
				'work': 'work_worker',
				'income': 3500, // Income decile: 7
				'diploma': 'diploma_postbac',
				'owner': true,
				'wedding': 'marital_couple',
				'children': 'children_0',
				'partnerWorks': true,
				'charity': true,
				'french': true
			}
		},
		{
			id: 'retired-citizen',
			type: 'RETIRED CITIZEN',
			text: 'RETIRED CITIZEN TEXT',
			name: 'Christian(e)',
			color: '#de8077',
			colorLight: '#f5c7c3',
			data: {
				'age': 70,
				'work': 'work_retired',
				'income': 3000, // Income decile: 6
				'diploma': 'diploma_none',
				'owner': true,
				'wedding': 'marital_couple',
				'children': 'children_0',
				'partnerWorks': false,
				'charity': true,
				'french': true
			}
		},
		{
			id: 'retired',
			type: 'RETIRED',
			text: 'RETIRED TEXT',
			name: 'Michel(e)',
			color: '#50a97c',
			colorLight: '#b6d1ab',
			data: {
				'age': 70,
				'work': 'work_retired',
				'income': 2600, // Income decile: 5
				'diploma': 'diploma_pro',
				'owner': true,
				'wedding': 'marital_couple',
				'children': 'children_0',
				'partnerWorks': false,
				'charity': false,
				'french': true
			}
		},
		{
			id: 'immigrant',
			name: 'Franck',
			color: '#aed08b',
			colorLight: '#d9e6d3',
			type: 'IMMIGRANT',
			text: 'IMMIGRANT TEXT',
			data: {
				'gender': 'gender_male',
				'age': 50,
				'work': 'work_worker',
				'income': 2200, // Income decile: 4
				'diploma': 'diploma_none',
				'owner': false,
				'wedding': 'marital_couple',
				'children': 'children_0',
				'partnerWorks': true,
				'charity': false,
				'french': false
			}
		}
	]

	$scope.happinessModel = {}
	$scope.modelVars = {}
	$scope.introMode = true
	$scope.choosePresetMode = true
	
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
    computePresetScores($scope.presets)
    $scope.$apply();
  });

  $scope.close = function () {
    // Component lookup should always be available since we are not using `ng-if`
    $mdSidenav('left').close()
      .then(function () {
        // $log.debug("close LEFT is done");
      });
  };

  $scope.setPreset = function (preset) {
  	$scope.introMode = false
  	$scope.choosePresetMode = false
		var k
  	for(k in preset.data) {
  		$scope[k] = preset.data[k]
  	}
  }

  $scope.choosePreset = function () {
  	$scope.choosePresetMode = true
  }

  // Update income deciles after chosen income
  $scope.$watch('income', updateDecileFromIncome)
	updateDecileFromIncome()
  
  function updateDecileFromIncome() {
  	$scope.incomeDecile = getDecileFromIncome($scope.income)
  	$scope.incomeDecileMessage = $scope.incomeDecileMessage_list[$scope.incomeDecile - 1]
  }

  // Update happiness variables and models after user variables
  var userModelVars = ['gender', 'age', 'diploma', 'work', 'wedding', 'children', 'french', 'charity', 'incomeDecile', 'partnerWorks', 'owner']
  $scope.$watchGroup(userModelVars, updateHappinessModel)
  function updateHappinessModel () {
  	// Are variables filled?
  	$scope.incompleteModel = ['age', 'diploma', 'work', 'wedding', 'children', 'french', 'charity', 'incomeDecile', 'partnerWorks', 'owner'].some(function(d){
  		return $scope[d] === undefined
  	})

		$scope.modelVars = {}
  	if (!$scope.incompleteModel) {
  		// Note: these have to match the coeffs
  		$scope.modelVars['age'] = $scope.age
  		$scope.modelVars['age-square'] = $scope.age * $scope.age
  		$scope.modelVars['age-cube'] = $scope.age * $scope.age * $scope.age
  		$scope.modelVars['is-woman'] = ($scope.gender === undefined) ? (0.5) : ($scope.gender == 'gender_female') ? (1) : (0)
  		$scope.modelVars['woman-by-age'] = $scope.modelVars['is-woman'] * $scope.modelVars['age']
  		$scope.modelVars['is-french'] = ($scope.french) ? (1) : (0)
  		$scope.modelVars['income-decile'] = $scope.incomeDecile
  		$scope.modelVars['income-decile-square'] = $scope.incomeDecile * $scope.incomeDecile
  		$scope.modelVars['is-owner'] = ($scope.owner) ? (1) : (0)
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
  		$scope.modelVars['partner-working'] = ($scope.modelVars['is-in-couple']) ? (($scope.partnerWorks) ? (1) : (0)) : (0)
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

  		// Compute models
  		$scope.happinessModel = computeHappinessModel($scope.coeffs, $scope.modelVars)

  	}
  }

 	function getDecileFromIncome(income) {
		// Note: the deciles range from 1 to 10 as in statistics
  	var incomeDecile = 1
  	income_deciles.forEach(function(max, i) {
  		if (income > max) {
  			incomeDecile = i+2
  		}
  	})
  	return incomeDecile
	}

  function computeHappinessModel(coeffs, modelVars) {
		var happinessModel = {}
		var happinessDimensions = ['current_life', 'leisure', 'housing', 'loved_ones']
		// FIXME: put this in a separate file
		var happinessDeciles = {
			current_life: [6.41, 6.8, 7.08, 7.29, 7.47, 7.61, 7.75, 7.89, 8.09],
			leisure: [5.8, 6.19, 6.45, 6.66, 6.85, 7.03, 7.23, 7.45, 7.76],
			housing: [6.98, 7.24, 7.51, 7.78, 7.92, 8.02, 8.1, 8.19, 8.3],
			loved_ones: [7.59, 7.79, 7.9, 8, 8.08, 8.16, 8.24, 8.35, 8.48]
		}
		happinessDimensions.forEach(function(d){
			var score = 0
			coeffs.forEach(function(coeff){
				score += coeff[d] * modelVars[coeff.id]
			})
			// Note: the deciles range from 1 to 10 as in statistics
	  	var decile = 1
	  	happinessDeciles[d].forEach(function(max, i) {
	  		if (score > max) {
	  			decile = i+2
	  		}
	  	})
	  	happinessModel[d] = {
	  		score: score,
	  		decile: decile
	  	}
		})
		return happinessModel
	}

	function computePresetScores(presets){
		presets.forEach(function(preset){
			var modelVars = {}
			modelVars['age'] = preset.data.age
  		modelVars['age-square'] = modelVars['age'] * modelVars['age']
  		modelVars['age-cube'] = modelVars['age'] * modelVars['age'] * modelVars['age']
  		modelVars['is-woman'] = (preset.data.gender === undefined) ? (0.5) : (preset.data.gender == 'gender_female') ? (1) : (0)
  		modelVars['woman-by-age'] = modelVars['is-woman'] * modelVars['age']
  		modelVars['is-french'] = (preset.data.french) ? (1) : (0)
  		modelVars['income-decile'] = getDecileFromIncome(preset.data.income)
  		modelVars['income-decile-square'] = modelVars['income-decile'] * modelVars['income-decile']
  		modelVars['is-owner'] = (preset.data.owner) ? (1) : (0)
  		modelVars['has-children-1'] = (preset.data.children == 'children_1') ? (1) : (0)
  		modelVars['has-children-2'] = (preset.data.children == 'children_2') ? (1) : (0)
  		modelVars['has-children-3'] = (preset.data.children == 'children_3') ? (1) : (0)
  		modelVars['is-working'] = (preset.data.work == 'work_worker') ? (1) : (0)
  		modelVars['is-student'] = (preset.data.work == 'work_student') ? (1) : (0)
  		modelVars['is-retired'] = (preset.data.work == 'work_retired') ? (1) : (0)
  		modelVars['is-at-home'] = (preset.data.work == 'work_athome') ? (1) : (0)
  		modelVars['has-dip-pro'] = (preset.data.diploma == 'diploma_pro') ? (1) : (0)
  		modelVars['has-bac'] = (preset.data.diploma == 'diploma_bac') ? (1) : (0)
  		modelVars['has-bac-plus'] = (preset.data.diploma == 'diploma_postbac') ? (1) : (0)
  		modelVars['is-in-couple'] = (preset.data.wedding == 'marital_couple') ? (1) : (0)
  		modelVars['is-divorced'] = (preset.data.wedding == 'marital_divorced') ? (1) : (0)
  		modelVars['is-widow'] = (preset.data.wedding == 'marital_widow') ? (1) : (0)
  		modelVars['has-children'] = (preset.data.children && preset.data.children != 'children_0') ? (1) : (0)
  		modelVars['partner-working'] = (modelVars['is-in-couple']) ? ((preset.data.partnerWorks) ? (1) : (0)) : (0)
  		modelVars['partner-working-by-children'] = modelVars['partner-working'] * modelVars['has-children']
  		modelVars['at-home-by-children'] = modelVars['is-at-home'] * modelVars['has-children']
  		modelVars['woman-by-unemployed'] = modelVars['is-woman'] * ((preset.data.work == 'work_unemployed') ? (1) : (0))
  		modelVars['at-work-by-dip-pro'] = modelVars['is-working'] * modelVars['has-dip-pro']
  		modelVars['at-work-by-bac'] = modelVars['is-working'] * modelVars['has-bac']
  		modelVars['at-work-by-bac-plus'] = modelVars['is-working'] * modelVars['has-bac-plus']
  		modelVars['at-work-by-in-couple'] = modelVars['is-working'] * modelVars['is-in-couple']
  		modelVars['woman-by-in-couple'] = modelVars['is-woman'] * modelVars['is-in-couple']
  		modelVars['at-work-by-children'] = modelVars['is-working'] * modelVars['has-children']
  		modelVars['in-couple-by-children'] = modelVars['is-in-couple'] * modelVars['has-children']
  		modelVars['charity'] = (preset.data.charity) ? (1) : (0)
  		modelVars['baseline'] = 1 // Constant

  		preset.happinessModel = computeHappinessModel($scope.coeffs, modelVars)
		})
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
