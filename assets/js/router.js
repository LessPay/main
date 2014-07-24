;(function (angular) {
	'use strict';

	angular.module('app.router', ['ui.router', 'app.controllers'])
	.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {

		

		$locationProvider.html5Mode(true);	
		$urlRouterProvider.otherwise("/merchant/404");
		$stateProvider
		.state('home', {
			url: "/",
			controller: 'HomeCtrl'
		})	

		.state('logout', {
			url: '/user/logout',
			controller: function () {
				window.location = '/auth/logout'
			}
		})	

		.state('404', {
			url: "/merchant/404",
			templateUrl: "/template/404",
			controller : 'NotFoundCtrl'
		})

		.state('accounts', {
			url : '/merchant/accounts',
			templateUrl: '/template/accounts/layout',
			abstract : true
		})

		.state('accounts.list', {
			url : '/list',
			views : {
				'page' : {
					templateUrl: '/template/accounts/list',
					controller : ['$scope', '$http', 'WalletService', function ($scope, $http, WalletService) {
						$scope.accounts = WalletService;

						$scope.changeAddress = function (account_id) {							
							WalletService.getFundAddress(account_id);
						}


					}]
				}
			}
			
		})

		.state('accounts.new', {
			url : '/new',
			views : {
				'page' : {
					templateUrl: '/template/accounts/new'
				}
			}			
		})


		.state('accounts.transfer', {
			url : '/transfer',
			views : {
				'page' : {
					templateUrl: '/template/accounts/transfer',
					controller : 'TransferCtrl'
				}
			}			
		})





		.state('settings', {
			url : '/merchant/settings',
			templateUrl: '/template/settings/index',
		})

		.state('settings.profile', {
			url : '/profile',
			templateUrl: '/template/settings/profile',
		})

		
		.state('settings.password', {
			url : '/password',
			templateUrl: '/template/settings/password',
		})


		.state('settings.regional', {
			url : '/regional',
			templateUrl: '/template/settings/regional',
		})


		.state('settings.limits', {
			url : '/limits',
			templateUrl: '/template/settings/limits',
		})

		.state('settings.notifications', {
			url : '/notifications',
			templateUrl: '/template/settings/notifications',
		})


		.state('settings.security', {
			url : '/security',
			templateUrl: '/template/settings/security',
		})








		


		.state('tickets', {
			url : '/merchant/tickets',		
			templateUrl : '/template/tickets/list'
		})






		.state('bills', {
			url : '/merchant/bills',
			templateUrl: '/template/bills/index',
			controller : ['$scope', '$modal', '$http', 'InvoiceService', function ($scope, $modal, $http, InvoiceService) {
			    
			    //$scope.invoices = InvoiceService;
			    
			    //InvoiceService.sync();

			    $scope.invoices = [];

			    $scope.data = {};
			    var today = new Date();

			    var data_from = new Date(),
			    monthAgo = data_from.setMonth(today.getMonth() - 1);
			    //Проверить на конец года

			    $scope.loading = false;
			    
			    $scope.query = {
			    	'trade_type' : 0,
			    	'date_to' : today,
			    	'date_from' : data_from,
			    	'type' : 'all',
			    	'current' : 1,
			    	'items_per_page' : 10
			    };

			    $scope.pager = {
			    	'total_items' : 1000,
			    	'max_size' : 5
			    }

			    $scope.total = 0;
			    $scope.count = 0;


			    $scope.update_view = function () {
			    	$scope.loading = true;
			    	return $http.get('/invoice', { params : $scope.query })
			    	.then(function (res) {

			    		var data = res.data,
			    		inv = data.data;


			    		function update () {
				    		$scope.invoices = inv;
				    		$scope.pager['total_items'] = res.data.count;
				    		$scope.total = data.total;
				    		$scope.count = data.count;
			    		}
			    		
			    		if(!$scope.$$phase) $scope.$apply(update);
			    		else update()

			    		$scope.loading = false;

			    	});
			    }

			    $scope.$watch('query', $scope.update_view, true);

			    

			    $scope.trade_types = ['All invoices', 'Paid', 'Not paid'];
			    $scope.periods = {
			    	'7' : 'last week',
			    	'30' : 'last month',
			    	'90' : 'last quarter',
			    	'365' : 'last year'
			    };

			    $scope.types = {
			    	'all' : 'all types',
			    	'incoming' : 'incoming type',
			    	'outcoming' : 'outcoming type'
			    };


			    $scope.$watch('query.date_from', function  () {
			    	$scope.stat['date_from'] = false;
			    });

			    $scope.$watch('query.date_to', function  () {
			    	$scope.stat['date_to'] = false;
			    });


			    $scope.setType = function  (type) {
			    	$scope.query['type'] = type;
			    	$scope.stat['type'] = false;
			    }


			    $scope.datepicker = {
			    	startView:'day', 
			    	minView:'day'
			    }


			    io.socket.on('invoice:created', $scope.update_view);



			    $scope.stat = {};

			    $scope.setTradeType = function (trade_type) {
		    		$scope.query['trade_type'] = trade_type;
			    	$scope.stat['trade_type'] = false;
			    }

			    $scope.getPeriod = function () {
			    	var diff =  (Math.floor(( $scope.query.date_to - $scope.query.date_from ) / 86400000)).toString();
			    	if(diff in $scope.periods) return $scope.periods[diff]
			    	return 'period';
			    }

			    
			    $scope.setPeriod = function (period) {
			    	period = parseInt(period);
			    	$scope.query['date_to'] = new Date();

			    	var new_date =  new Date($scope.query['date_to']);
			    	$scope.query['date_from'] = new_date.setDate(new_date.getDate() - period);			    	
			    	$scope.stat['period'] = false;
			    
			    }



			    // $scope.new = function () {
			    //     InvoiceService.create(angular.copy($scope.data));
			    // }

			    $scope.reject = function () {
			    	
			    }

			    $scope.pay = function (invoice, $event) {

			    }

				$scope.createInvoice = function () {
					InvoiceService.createInvoice().then();					
				};

				$scope.createInvoice();

				$scope.showInvoice = function () {

					var modalInstance = $modal.open({
							templateUrl: 'myModalContent.html',
							controller: function  () {
								
							},
							resolve: {
							items: function () {
								return $scope.items;
							}
						}
					});

					modalInstance.result.then(function (selectedItem) {
						$scope.selected = selectedItem;
					}, function () {
						//$log.info('Modal dismissed at: ' + new Date());
					});
				};




			}]
		}) 


		



		.state('vouchers', {
			url : '/merchant/vouchers',
			templateUrl: '/template/vouchers/index',
		})	


		.state('vouchers.buy', {
			url : '/buy',
			views : {
				'page' : {
					templateUrl: '/template/vouchers/buy',
					controller: ['$scope', '$http', 'WalletService', function ($scope, $http, WalletService) {
						$scope.wallet = WalletService;
						$scope.data = {};

						$scope.methods = {
							 'mail' : 'Email' ,
							 'xmpp' : 'Jabber' ,
							 'icq' : 'ICQ' ,
							 'sms' : 'SMS' ,
						};

						WalletService.sync().then(function(d) {
							$scope.data['from_account'] = d[0];
						});

						$scope.create = function () {
							$http.post('/voucher/create', angular.copy($scope.data))
							.success(console.log).error(console.log);

							delete $scope.data.amount;
							delete $scope.data.mantissa;

							// $scope.data = {};
							// $scope.data['from_account'] = d[0];

						}


					}]
				}
			}
		})	


		.state('vouchers.list', {
			url : '/list',
			views : {
				'page' : {
					templateUrl: '/template/vouchers/list',
					controller: 'manageVoucherCtrl'
				}
			}
		})		

		.state('vouchers.activate', {
			url : '/activate',
			views : {
				'page' : {
					templateUrl: '/template/vouchers/activate',
					controller: ['$scope', '$http', function ($scope, $http) {
						$scope.data = {};

						$scope.activate = function () {
							$scope.error = '';

							$http.get('/voucher/activate', { params : $scope.data })
							.success(console.log)
							.error(function (data) {
								$scope.error = data.error;
							});

							$scope.data = {};
						}
					}]
				}
			}
		})	


		.state('vouchers.activate_code', {
			url : '/activate/{code}',
			views : {
				'page' : {
					templateUrl: '/template/vouchers/activate',
					controller: ['$scope', '$http', '$stateParams', function ($scope, $http, $stateParams) {
						$scope.data = {
							vid : $stateParams.code
						};

						$scope.activate = function () {
							$scope.error = '';

							$http.get('/voucher/activate', { params : $scope.data })
							.success(console.log)
							.error(function (data) {
								$scope.error = data.error;
							});

							$scope.data = {};
						}
					}]
				}
			}
		})		






		


		;

	}]);

	
})(angular)