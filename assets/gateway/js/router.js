;(function (angular) {
	'use strict';

	angular.module('app.router', ['ui.router', 'app.controllers'])

	.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

		

		//$locationProvider.html5Mode(true);

		$urlRouterProvider.otherwise("404");
		$stateProvider


			.state('home', {
				url: "/",
			})

			.state('billing', {
				url: "/billing/:id",
				templateUrl : '/template/gateway/billing'
			})


			.state('confirmation', {
				url: "/confirmation",
				templateUrl : '/template/gateway/confirmation'
			})




			.state('404', {
				url: "/404",
				templateUrl: "/template/404",
			})


		;

	}]);

	
})(angular)