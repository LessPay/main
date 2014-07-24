;(function (angular) {
	'use strict';

	angular.module('app.router', [
		'ui.router', 
		'app.controllers'
	])

	.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

		

		//$locationProvider.html5Mode(true);

		$urlRouterProvider.otherwise("404");
		$stateProvider
		
			.state('home', {
				url: "/",
			})


			.state('fee', {
				url: "/fee",
			})

			.state('limit', {
				url: "/limit",
			})


			.state('support', {
				url: "/support",
			})


			.state('settings', {
				url: "/settings",
			})
			
			/*
			.state('test', {
				url: "/test/:id",
				templateUrl : '/template/gateway/billing'
			})			
			*/

			.state('404', {
				url: "/404",
				templateUrl: "/template/404",
			})
		;

	}]);

	
})(angular)
