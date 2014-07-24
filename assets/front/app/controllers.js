;(function (angular) {
	angular.module('app.controllers', [])
	

	.controller('FrontPageCtrl', ['$scope', '$http', 'PageService', 
		function ($scope, $http, page) {
		
			page.title = 'Home';

			$scope.data  = {};

			$scope.login = function () {
				$scope.$broadcast("autofill:update");


				$http.post('/auth/login', $scope.data)
				.success(function () {
					location.reload('/');
				})
				.error(function (data) {
					$scope.error = data.error;
				});
			}

	}])

	.controller('UserLogoutCtrl', ['$scope', function ($scope) {		
		location.reload('/auth/logout');
	}])


	.controller('RegistrationCtrl', ['$scope', '$http', '$state', 'PageService', function ($scope, $http, $state, page) {
		page.title = 'Registration';

		$scope.data = {};

		$scope.error = '';

		$scope.registration = function () {

			$http.post('/auth/register', $scope.data)
			.success(function (data) {
				$state.go('home');
			})
			.error(function (data) {
				console.log(data);
				$scope.error = data.error;
			})
		}

	}])





	.controller('HomeCtrl', ['$scope', 'PageService', function ($scope, page) {
		page.title = 'Home';

	}])

	.controller('NotFoundCtrl', ['$scope', 'PageService', function ($scope, page) {
		page.title = 'Page not found';

	}])


	.controller('DumpsCtrl', ['$scope', 'PageService', function ($scope, page) {
		page.title = 'Search dumps';

	}])	

	.controller('BillingCtrl', ['$scope', 'PageService', function ($scope, page) {
		page.title = 'Billing';

	}])
	.controller('PackagesCtrl', ['$scope', 'PageService', function ($scope, page) {
		page.title = 'Packages';

	}])
	.controller('OrdersCtrl', ['$scope', 'PageService', function ($scope, page) {
		page.title = 'Orders';

	}])
	.controller('CheckerCtrl', ['$scope', 'PageService', function ($scope, page) {
		page.title = 'Checker';

	}])
	.controller('SupportCtrl', ['$scope', 'PageService', function ($scope, page) {
		page.title = 'Support';

	}])
	.controller('CartCtrl', ['$scope', 'PageService', function ($scope, page) {
		page.title = 'Cart';

	}])
	.controller('ProfileCtrl', ['$scope', 'PageService', function ($scope, page) {
		page.title = 'Profile';

	}])



	;

})(angular)