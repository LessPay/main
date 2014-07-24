;(function (angular) {
	angular.module('app.services', [])
	


	.factory('PageService', function () {
		var page = {
			title: 'Home',
			pageHeader : '',
		};

		return page;		
	});




})(angular)