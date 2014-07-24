;(function (angular) {
	
	angular.module('app', [
		'app.router', 
		'app.directives', 
		'app.services', 
		'ui.bootstrap'
	])

	
	;


	angular.bootstrap(document , ['app']);
})(angular)
