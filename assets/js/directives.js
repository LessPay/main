;(function (angular) {
	angular.module('app.directives', [])
	
	.directive("autofill", function () {
	    return {
	        require: "ngModel",
	        link: function (scope, element, attrs, ngModel) {
	            scope.$on("autofill:update", function() {
	                ngModel.$setViewValue(element.val());
	            });
	        }
	    }
	})

	.directive('focusMe', function($timeout, $parse) {
		return {
			link: function(scope, element, attrs) {
				var model = $parse(attrs.focusMe);
				scope.$watch(model, function(value) {
					if(value === true)  $timeout(function() { element[0].focus();  });						
				});

				element.bind('blur', function() {
					if(model.assign) scope.$apply(model.assign(scope, false));
				});
			}
		};
	})


	.directive('loading', function () {
		return {
			restrict: 'E',
			replace:true,
			template: '<i class="fa fa-spinner fa-spin fa-fw"></i>',
			link: function (scope, element, attr) {
			      scope.$watch('loading', function (val) {

			          element.css('opacity' , val ? '1' : '0' );
			          element.css('display' , val ? 'inline-block' : 'none' );
			      });
			}
		}
	})



	.directive('captcha', function () {
		return function ($scope, element, attrs, controller) {
			var tmp = element.attr('src');

			element.on('click', function () {
				element.attr('src', tmp + '?t=' + Date.now())
			});
		}
	})

	;

})(angular);