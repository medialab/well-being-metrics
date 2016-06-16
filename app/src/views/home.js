'use strict';

angular.module('app.home', ['ngRoute'])

.config(function($routeProvider, $translateProvider) {
  $routeProvider.when('/', {
    templateUrl: 'src/views/home.html'
  , controller: 'HomeController'
  })

  var translationEn = {
    'TITLE': 'Hello',
    'FOO': 'This is a paragraph'
  }

  $translateProvider.translations('en', translationEn);
 
  $translateProvider.translations('de', {
    'TITLE': 'Hallo',
    'FOO': 'Dies ist ein Absatz'
  });
 
  $translateProvider
  	.preferredLanguage('en')
  	// .determinePreferredLanguage()
  	.fallbackLanguage('en');
})

.controller('HomeController', function($scope, $location) {
	
});