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