;(function (angular) {
	angular.module('app.services', [])
	


    .factory('WalletService',  ['$http', '$rootScope', function ($http, $rootScope) {   

        var service = {
            sync : function () {
                var me = this;

                promise = $http.get('/accounts').then(function (response) {
                    me.data = response.data;
                    return response.data;
                });

                return promise;
            },


            methods : {
                'account' : 'CustomerID',
                'email' : 'Email',
                'jid' : 'JabberID',
                'icq' : 'ICQ',
                'phone' : 'SMS'
            },

            data : [],

            getFundAddress : function (account_id) {
                var me = this;
                return $http.get('/accounts/getfundaddress', { params : { 'account_id' : account_id } });
            }

        }

        io.socket.on('account:changed', function (account) {

            service.data.forEach(function (item) {
                if(item.id == account.id) item = angular.extend(item, account);                
            });
        });

        // io.socket.get('/message', {}, console.log);
        io.socket.on('transaction_complete', function (data) {

            service.data.forEach(function (item, id) {
                if(item.id == data.account) item.balance = data.balance;                
            });

            $rootScope.$broadcast('transaction_complete', data);
        });

        service.sync();
        setInterval(function () { service.sync() }, 30000);
        
        return service;
    }])


    .factory('VoucherService',  ['$http', '$rootScope', function ($http, $rootScope) {   

        var service = {
            sync : function () {
                var me = this;

                io.socket.get('/message', {}, function  (dat) { console.log(dat); });

                promise = $http.get('/accounts').then(function (response) {
                    me.data = response.data;
                    return response.data;
                });

                return promise;
            },

            data : []
        }

        io.socket.on('transaction_complete', function (data) {

            service.data.forEach(function (item, id) {
                if(item.id == data.account) item.balance = data.balance;                
            });

            $rootScope.$broadcast('transaction_complete', data);
        });

        service.sync();
        //setInterval(function () { service.sync() }, 3000);
        
        return service;
    }])


    .factory('InvoiceService',  ['$http', '$rootScope', '$modal', function ($http, $rootScope, $modal) {   

        var service = {
            sync : function () {
                var me = this;

                promise = $http.get('/invoice').then(function (response) {
                    me.data = response.data;
                    return response.data;
                });

                return promise;
            },

            data : [],


            createInvoice : function (data) {
                var service = this;
                
                var modalInstance = $modal.open({

                        templateUrl: '/template/bills/createInvoice',
                        controller: ['$scope', 'WalletService', function  ($scope,  WalletService) {
                            $scope.load = false;
                            $scope.error = "";

                            $scope.dds = {};

                            $scope.wallet = WalletService;

                            var lifetime = new Date();
                            lifetime.setDate(lifetime.getDate() + 2);

                            $scope.data = {
                                to_type : 'email',
                                lifetime: lifetime
                            };

                            $scope.$watch('data.lifetime', function () {
                               $scope.dds['lifetime']  = false;
                            });

                            $scope.datepicker = {
                                startView:'day', 
                                minView:'day'
                            }

                            $scope.data['to_address'] = 'commerce@westtrade.tk';
                            $scope.data['amount'] = 100;
                            $scope.data['mantissa'] = 100;
                            $scope.data['comment'] = "Bla bla";


                            $scope.setMethod = function (code, method) {
                                $scope.data['to_type'] = code;
                                $scope.dds.mthds = false;
                            }

                            $scope.selectAccount = function (account) {
                                $scope.data['from_account'] = account;
                                $scope.data['code'] = account['code'];
                                $scope.dds.accs = false;
                            }

                            $scope.selectAccount($scope.wallet.data[0]);




                            $scope.cancel = function  () {
                                $scope.$close();
                            }

                            $scope.create = function () {
                                $scope.load = true;
                                $scope.error = '';

                                service.create($scope.data)
                                .success(function (data) {
                                    
                                })
                                .error(function (err) {
                                    $scope.error = err.error;
                                })
                                .finally(function () {
                                    $scope.load = false;
                                });
                            };
                        }],
                        resolve: data
                    });

                return modalInstance.result;
            },

            create : function (data) {
                return $http.post('/invoice/create', data);
            },


            billInfo : function (bid) {
                
            }
        }

        io.socket.on('invoice:create', function (data) {
            console.log(data);
            service.sync();

            // service.data.forEach(function (item, id) {
            //     if(item.id == data.account) item.balance = data.balance;                
            // });

        });

        service.sync();
        //setInterval(function () { service.sync() }, 3000);
        
        return service;
    }])









    .factory('ContactService', ['$http', function ($http) {
            var promise;

            var service = {
                list : [],
                contacts : function () {
                    var me = this;

                    promise = $http.get('/contact').then(function (response) {
                        me.list = response.data;
                        return response.data;
                    });

                    return promise;
                }
            }
            
            return service;
    }])


    .factory('TemplatesService', ['$http', '$rootScope', function ($http, $rootScope) {
            var promise;

            var service = {
                templates : [],
                sync : function () {
                    var me  = this;

                    promise = $http.get('/templates').then(function (response) {

                        me.templates = response.data;
                        $rootScope.$broadcast('templates_update', me.templates);
                        return response.data;
                    });

                    

                    return promise;
                }
            }

            
            
            return service;
    }])

	.factory('PageService', function () {
		var page = {
			title: 'Home',
			pageHeader : '',
		};

		return page;		
	})


    ;




})(angular)