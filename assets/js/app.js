;(function (angular) {
	//, 'ngScrollbar'


	io.socket.on('connect', function (socket) {
		io.socket.get('/message', {}, function  (dat) { });
	});

	

	angular.module('app', [
        'ui.bootstrap.datetimepicker',
		'app.router', 
		'app.directives', 
		'app.services', 
		'ui.bootstrap', 
		'angular-flip', 
		'iso.directives', 
		'angular-loading-bar', 
		'monospaced.qrcode'
	])


	.directive("lpDropdown", function () {
	    return {
	        link: function (scope, element, attrs, ngModel) {

        		var dds = angular.element(element[0].querySelectorAll('.dropdown'));

        		dds.bind('mouseenter', function  () {
        			angular.element(this).addClass('open');
    			})

    			.bind('mouseleave', function  () {
    				angular.element(this).removeClass('open');
    			});

    			angular.element(element[0].querySelectorAll('.dropdown .dropdown-menu li'))
    			.bind('click', function () {
    				var el = this;

    				angular.element(this).parent().css('display', 'none'); 
    				angular.element(this).parent().parent().removeClass('open');
    				setTimeout(function(){ angular.element(el).parent().removeAttr('style')   }, 100);
    				
    			});

	        }
	    }
	})



	.directive("lpSortable", function () {
	    return {
	        link: function (scope, element, attrs, ngModel) {
	        	console.log('hi');
	        	element.sortable({ appendTo: document.body })

	        }
	    }
	})




	.filter('dateConv', function() {
		return function(input) {
			return new Date(input);
		};
	})
	
	.run(['$rootScope', 'PageService', function ($rootScope, page) {
		$rootScope.page = page;
	}])

	;


	angular.bootstrap(document , ['app']);
})(angular)