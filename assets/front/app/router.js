;(function (angular) {
	'use strict';

	angular.module('app.router', ['ui.router'])
	.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {



		$locationProvider.html5Mode(true);
		$urlRouterProvider.otherwise("/frontpage/404");
		$stateProvider
		.state('home_back', {
			url: "/front",
			templateUrl: '/template/front/home',

			//controller: 'HomeCtrl'
		})		

		.state('home', {
			url: "/",
			templateUrl: '/template/front/home',
		})

		.state('404', {
			url: "/frontpage/404",
			templateUrl: "/template/404",
			//controller : 'NotFoundCtrl'
		})


		.state('content', {
			url: '/frontpage/content/{layout}/{path:.*}',
			templateUrl: function ($stateParams) {
				
				return '/template/front/' + $stateParams['layout'];
			},
			controller : ['$scope', '$stateParams', function ($scope, $stateParams) {
				var language = 'en';
				$scope.content = '/content/' + language + '/' + $stateParams['path'];
			}]
		}) 





		.state('registration', {
			url : '/frontpage/registration/:email',
			templateUrl: '/template/front/registration',
			controller: 'fastRegCtrl'
		})

		.state('store_registration', {
			url : '/frontpage/store_registration/:email',
			templateUrl: '/template/front/registration',
			controller: 'fastRegCtrl'
		})




		.state('send', {
			url : '/frontpage/send',
			templateUrl: '/template/front/send',

		})


		

		.state('restore', {
			url: '/frontpage/restore/:template/:customer_id',
			templateUrl: '/template/front/restore',
			controller: ['$scope', '$http', '$stateParams', function ($scope, $http, $stateParams) {

				$scope.data = {
					template : $stateParams['template']
				};

				if($stateParams['customer_id'].length) $scope.data['customer_id'] = $stateParams['customer_id'];

				$scope.error = '';
				$scope.canSend = true;

				$scope.restore = function () {
					$scope.canSend = false;
					$scope.error = '';

					$http.post('/auth/restore', $scope.data)
						.success(function  (data) {
							if(data) window.location.href = '/';
						})
						.error(function (data) {
							$scope.error = data.error;
							console.log(data);
						})
						.finally(function(){
							$scope.canSend = true;
						});

				}
			}]
		})

		.state('login', {
			url: '/frontpage/login',
			templateUrl: '/template/front/login',
			controller : ['$scope', '$http', '$state', function ($scope, $http, $state) {
				$scope.data = {};
				$scope.error = '';
				$scope.canSend = true;

				$scope.togglePass = function () {					
					$scope.showPassword = !$scope.showPassword;
					$scope.$broadcast("autofill:update");
				}

				$scope.restorePassword = function () {
					$scope.$broadcast("autofill:update");
					$state.go("restore", { template : "customer_id", customer_id : $scope.data.customer_id }, {inherit:false});
				}

				$scope.login = function () {
					$scope.error = '';
					$scope.canSend = false;
					
					$scope.$broadcast("autofill:update");

					$http.post('/auth/login', $scope.data)
						.success(function  (data) {
							if(data) window.location.href = '/';
						})
						.error(function (data) {
							$scope.error = data.error;
							console.log(data);
						})
						.finally(function(){
							$scope.canSend = true;
						});
				}
			}]
		})



		;

	}]);


})(angular)
