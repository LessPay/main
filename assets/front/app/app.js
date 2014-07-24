;(function (angular) {
	//, 'ngScrollbar'

	function getWindowHeight () {
		var height;
		if (document.compatMode === 'BackCompat') height = document.body.clientHeight;
		else  height = document.documentElement.clientHeight;

		return height;
	}

	function getElementSize (element) {
		var style = window.getComputedStyle(element, null);
		return { 'height' : parseInt(style.getPropertyValue("height")), 'width' : parseInt(style.getPropertyValue("width")) };
	}

	function attachResize (callback) {
		if(window.attachEvent) window.attachEvent('onresize', callback);		
		else if(window.addEventListener)  window.addEventListener('resize', callback, true);		
		else window.onresize = callback;		
	}

	var sizeDimension = 1280.00/720.0;

	function setVideoSize (element) {

		var parent = element.parent()[0];
		var size = getElementSize(parent);

		if(size.width / size.height < sizeDimension) 
			return element.css({
				'height' : 'auto',
				'width' : (size.height / 0.5625) + 'px'
			});

		element.css({
			'height' : 'auto',
			'width' : '100%'
		});

	}

	


	angular.module('app', [
		'app.router',
		'ui.bootstrap', 
		'duScroll',
		'angular-loading-bar',
		'cfp.loadingBar',
		'ngSanitize'
	])
		.run(['cfpLoadingBar' , function (cfpLoadingBar) {
			cfpLoadingBar.start();
		}])

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


		.directive("screenHeight", function () {
		    return {
		        link: function (scope, element, attrs, ngModel) {

		        	element.css('height', getWindowHeight() + 'px');
		        	attachResize(function () {
		        		element.css('height', getWindowHeight() + 'px');
		        	});		        	
		        }
		    }
		})

		.directive("overviewVideo", function () {
		    return {
		        link: function (scope, element, attrs, ngModel) {     	


		        	setVideoSize(element);
					attachResize(function () { setVideoSize(element) })		        	
		        	
		        }
		    }
		})





		.directive("videobg", function () {
		    return {
		        link: function (scope, element, attrs, ngModel) {
		        	console.log(scope);

		        }
		    }
		})

		.directive('stopVideo', ['$document', function ($document) {
 	        return {
 	            link: function ($scope, element, attrs) {
 	            	$scope.played = true;

 
 	            	element.on('click', function () {   
 	            		
 	            		$scope.$apply(function () {
 	            			$scope.played = !$scope.played;
 	            			
 	            			var video = document.getElementById("overview_video");
							if(video) !$scope.played ? video.pause() : video.play();

							angular.element(document.getElementsByClassName('dot')).toggleClass('blured');

 	            		});


 	            	});
 	            },
 	            template: '<div id="start_stop"><i class="fa fa-fw" ng-class="{ \'fa-pause\' : played, \'fa-play\' : !played,  }"></i> </div>',
 	            replace: true,
 	            restrict: 'E'       
 	        }
 	    }])


		.directive('captcha', function () {
			return function ($scope, element, attrs, controller) {
				var tmp = element.attr('src');

				element.on('click', function () {
					element.attr('src', tmp + '?t=' + Date.now())
				});
			}
		})


		.controller('registrationCtrl', ['$scope', function ($scope) {

		}])

		.controller('fastRegCtrl', ['$scope', '$http', '$sce', '$stateParams',   function($scope, $http, $sce, $stateParams){
			$scope.data = {
				accountType: 'client'
			};

			if($stateParams.email) 
				$scope.data['email'] = $stateParams.email;

			$scope.error = ' ';
			$scope.canSend = true;

			$scope.send = function () {
				$scope.canSend = false;
				$scope.error = ' ';

				$http.post('/auth/registration', $scope.data)
				.success(function (data) {
					if(data.success) window.location.href = '/';
				})
				.error(function (data) {
					$scope.error = data.error;
					$sce.trustAsHtml($scope.error);
				})
				.finally(function () {
					$scope.canSend = true;
				})
				;
			}

		}])






		.controller('mainCtrl', ['$scope', '$modal', function ($scope, $modal) {
			$scope.navbarCollapsed = 1;

			$scope.registration = function(e) {
				e.preventDefault();

				$modal.open({
					templateUrl: '/template/front/registration',
					controller: 'registrationCtrl',
					size: 800,

					/*resolve: {
						items: function () {
							return $scope.items;
						}
					}*/
				});

			}


			$scope.open = function (e) {

				e.preventDefault();

				$modal.open({
					templateUrl: '/template/front/registration',
					controller: 'registrationCtrl',
					size: 400,

					/*resolve: {
						items: function () {
							return $scope.items;
						}
					}*/
				});
			}

		}])

	;


	angular.bootstrap(document , ['app']);
})(angular)
