var endpoints = angular.module('parlay.endpoints', ['ui.router', 'parlay.endpoints.manager', 'parlay.endpoints.search', 'parlay.endpoints.endpoint', 'parlay.endpoints.controller']);

/* istanbul ignore next */
endpoints.config(function($stateProvider) {
    $stateProvider.state('endpoints', {
        url: '/endpoints',
        templateUrl: '../parlay_components/endpoints/views/base.html',
        controller: 'ParlayEndpointController'
    });
});

/* istanbul ignore next */
endpoints.directive('parlayEndpointsToolbar', ['$mdMedia', function ($mdMedia) {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoints-toolbar.html',
        link: function ($scope, element, attributes) {
	        
	        // Watch the size of the screen, if we are on a screen size that's greater than a small screen we should always display labels.
            $scope.$watch(function () {
	            return $mdMedia('gt-sm');
            }, function (large_screen) {
	            $scope.large_screen = large_screen;
            });
            
        }
    };
}]);