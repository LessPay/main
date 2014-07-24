;(function (angular) {
	//, 'ngScrollbar'

    function setActive (element, isActive) {
        return isActive ? element.addClass('active') : element.removeClass('active');
    }


	angular.module('app', ['app.router', 'app.controllers', 'ui.bootstrap'])


    
    .directive('holderFix', function () {
        return {
            link: function (scope, element, attrs) {
                Holder.run({ images: element[0], nocss: true });
            }
        };
    })    



    .directive('activeTab', ['$state', function ($state) {
            return {
                link: function ($scope, element, attrs) {
                    var tab = attrs['activeTab'];

                    $scope.$on('$stateChangeSuccess', function () {
                        setActive(element, $state.current.name === tab);
                    })
                    
                    setActive(element, $state.current.name === tab);                    
    
                }
            };
        }])

	;


	angular.bootstrap(document , ['app']);
})(angular)