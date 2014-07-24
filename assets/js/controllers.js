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


	.controller('BalanceWidgetCtrl', ['$scope', 'WalletService', function ($scope, WalletService) {
		$scope.default = 0;
		$scope.showCurrentBalance = true;
		$scope.loading = false;

		$scope.setDefault = function (index) {
			$scope.default = index;
		}

		$scope.accounts = WalletService;

		$scope.refresh = function () {
			$scope.loading = true;
			$scope.accounts.sync().then(function  () { $scope.loading = false; });
		}

		$scope.$on('transaction_complete', function (data) {
			if(!$scope.$$phase) $scope.$digest();			
		})

	}])


	.controller('TemplatesWidgetCtrl', ['$scope', 'TemplatesService', function ($scope, TemplatesService) {

		$scope.$on('templates_update', function (data) {
			$scope.templates = TemplatesService.templates;
		});
		
		TemplatesService.sync();
	}])


	.controller('InfoWidgetCtrl', ['$scope', '$http', function ($scope, $http) {
		$scope.data = {};

		$http.get('/auth').success(function (data) {
			$scope.data = data;
		})
	}])



	.controller('LastTransCtrl', ['$scope', '$http',  function ($scope, $http) {
		$scope.trs = [];

		// io.socket.get('/message', {}, function  (dat) { console.log(dat); });

		$scope.newTrs = false;
		$scope.qty = 5;

		$scope.update = function  () {
			$http.get('/transaction/last', {
		        params: { qty: $scope.qty }
		     })
			.success(function (data) {
				$scope.trs = data;
			});
		}

		$scope.update();

		$scope.getNew = function  () {
			$scope.update();
			$scope.newTrs = false;
		}

		$scope.more = function  () {
			$scope.$emit('iso-method', {name:'layout', params:null});

			$scope.qty = 15;
			$scope.update();
		}

		io.socket.on('transaction_complete', function (data) {
			$scope.update();
			// $scope.newTrs = true;
		});
		

	}])






	.controller('TransferCtrl', ['$scope', '$http', 'PageService', 'cfpLoadingBar', 'WalletService', 'ContactService', 'TemplatesService' ,
		function ($scope, $http, page, cfpLoadingBar, WalletService, ContactService, TemplatesService) {
		
			//page.title = 'Transfer';

			$scope.loading = false;
			$scope.data  = {};
			$scope.error = '';

			$scope.contacts = [];

			$scope.$on('templates_update', function (data) {
				$scope.templates = TemplatesService.templates;
			});

			TemplatesService.sync();

			
			ContactService.contacts().then(function(d) {
				$scope.contacts = d;
			});

			$scope.methods = {
				'contact' : 'LP Contact',
				'account' : 'CustomerID',
				'email' : 'Email',
				'jid' : 'JabberID',
				'icq' : 'ICQ',
				'phone' : 'SMS'
			}


			
			$scope.data = {
				to_type : 'account',
				to_address : '00000010',
				amount : 100,
				save_template : true,
				template_name : 'Test'
			}

			WalletService.sync().then(function(d) {
				$scope.accounts = d;
				$scope.data.from_account = d[0];				
			});

			$scope.fee = 10;


			$scope.limit = {};

			

			$scope.dds = {};

			$scope.saveTemplate = function () {
				$scope.error = '';

				$scope.loading = true;
				cfpLoadingBar.start();

				var send_data = angular.copy($scope.data);

				$http.post('/templates/create', send_data)
				.success(function (data) {
					TemplatesService.sync();
				})
				.error(function (data) {
					$scope.error = data;
				})
				.finally(function (data) {
					$scope.loading = false;
				})
				;

			}

			// data.from_account=account


			$scope.setAccount = function (account) {
				$scope.data['from_account'] = account;
				$scope.dds['accs'] = false;
			}

			$scope.setMethod = function (code, method) {
				$scope.data['to_type'] = code;
				$scope.dds['mthds'] = false;
			}

			$scope.setTemplate = function (data) {
				$scope.data = data;
				$scope.dds['tpls'] = false;
			}



			$scope.transfer = function () {
				$scope.error = '';

				$scope.loading = true;
				cfpLoadingBar.start();

				var send_data = angular.copy($scope.data);
				send_data.account = send_data.from_account.id;
				delete send_data.from_account;


				$http.post('/fund/send', send_data)
				.success(function (data) {
					
				})
				.error(function (data) {
					$scope.error = data.error;
				})
				.finally(function (data) {
					$scope.loading = false;
				})
				;

			}

	}])


	.controller('manageVoucherCtrl', ['$scope', '$http', '$modal', function ($scope, $http, $modal) {
		
			$scope.today = function() {
				$scope.dt = new Date();
			};
			
			$scope.today();

			$scope.clear = function () {
				$scope.dt = null;
			};

			// Disable weekend selection
			$scope.disabled = function(date, mode) {
				return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
			};

			$scope.toggleMin = function() {
				$scope.minDate = $scope.minDate ? null : new Date();
			};

			$scope.toggleMin();

			$scope.open = function($event, dest) {
				$event.preventDefault();
				$event.stopPropagation();

				$scope['opened' + dest] = true;
			};


			$scope.reject = function (vid) {
				$http.get('/voucher/reject', { params : { 'vid' : vid }})
				.success(function (data) {
					console.log(data);
				})
			}


			$scope.sendWindow = function (vid) {

		    	$modal.open({
					templateUrl: '/template/vouchers/send',
					controller: ['$scope', '$http', '$modalInstance', 'vid', function ($scope, $http, $modalInstance, vid) {
						$scope.methods = {
							 'mail' : 'Email' ,
							 'xmpp' : 'Jabber' ,
							 'icq' : 'ICQ' ,
							 'sms' : 'SMS' ,
						};

						$scope.data = {
							vid : vid,
							method : $scope.methods['mail']
						};
						
						$scope.cancel = function () {
							$modalInstance.dismiss('cancel');
						}

						$scope.send = function () {
							$http.get('/voucher/send', { params : $scope.data }).
							success(function (data) {
								
								$modalInstance.dismiss('cancel');
							})
							.error(function (data) {
								
							});
						}
					}],
					size: 800,
					resolve: {
						vid: function () {
							return vid;
						}
					}
				});
			};




			$scope.dateOptions = {
				formatYear: 'yy',
				startingDay: 1
			};

			$scope.initDate = new Date('2016-15-20');
			$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
			$scope.format = $scope.formats[0];

			
			$scope.vouchers = [];
			

			$http.get('/voucher')	
			.success(function (data) {
				$scope.vouchers = data;
			});

			io.socket.on('voucher', function (data) {
				console.log(data);

				$http.get('/voucher')	
				.success(function (data) {
					$scope.vouchers = data;
					if(!$scope.$$phase) $scope.$digest();
				});

			});



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


	;

})(angular)