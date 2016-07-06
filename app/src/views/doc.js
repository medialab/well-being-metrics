'use strict';

angular.module('app.doc', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/doc/:content', {
    templateUrl: 'src/views/doc.html'
  , controller: 'DocController'
  })
}])

.controller('DocController', function(
	$scope,
	$rootScope,
	$location,
	$timeout,
	$routeParams,
	$translate
) {
	$scope.target

	$rootScope.$on('$translateChangeSuccess', update)
	update()
	function update() {
		$scope.target = 'src/locale/' + $routeParams.content + '-' + $translate.use() + '.html'
	}
})
