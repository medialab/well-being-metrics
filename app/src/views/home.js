'use strict';

angular.module('app.home', ['ngRoute'])

.config(function($routeProvider, $translateProvider) {
  $routeProvider.when('/', {
    templateUrl: 'src/views/home.html'
  , controller: 'HomeController'
  })

  $translateProvider.translations('en', {
    'TITLE': 'Hello',
    'FOO': 'This is a paragraph'
  });
 
  $translateProvider.translations('de', {
    'TITLE': 'Hallo',
    'FOO': 'Dies ist ein Absatz'
  });
 
  $translateProvider.preferredLanguage('en');
})

.controller('HomeController', function($scope, $location) {
	
});