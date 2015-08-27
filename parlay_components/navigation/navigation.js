var navigation = angular.module('parlay.navigation', ['ngAnimate', 'ui.router', 'ngMaterial', 'ngMdIcons', 'promenade.broker', 'parlay.protocols.list_controller', 'templates-main']);

/* istanbul ignore next */
navigation.controller('parlayToolbarController', ['$scope', '$state', function ($scope, $state) {
    
    /**
	 * Returns the name of the current state from UI.Router.
	 * @returns {String} - state name
	 */
    $scope.getStateName = function () {
	    return $state.$current.self.name;
    };
    
}]);

navigation.controller('ParlayConnectionStatusController', ['$scope', '$mdDialog', function ($scope, $mdDialog) {
    
    /* istanbul ignore next */
    $scope.viewConnections = function (event) {
        $mdDialog.show({
            targetEvent: event,
            clickOutsideToClose: true,
            controller: 'ParlayConnectionListController',
            templateUrl: '../parlay_components/communication/directives/parlay-connection-list-dialog.html'
        });
    };    
    
}]);

/* istanbul ignore next */
navigation.directive('parlayConnectionStatus', ['PromenadeBroker', '$mdMedia', function (PromenadeBroker, $mdMedia) {
    return {
        scope: {},
        templateUrl: '../parlay_components/navigation/directives/parlay-connection-status.html',
        controller: 'ParlayConnectionStatusController',
        link: function ($scope, element, attributes) {
	        // Watch our connection status to Broker and update the icon if connectivity changes.
	        $scope.$watch(function () {
                return PromenadeBroker.isConnected();
            }, function (connected) {
	            $scope.connected = connected;
                $scope.connection_icon = connected ? 'cloud' : 'cloud_off';
            });
            
            // Watch the size of the screen, if we are on a screen size that's greater than a small screen we should always display labels.
            $scope.$watch(function () {
	            return $mdMedia('gt-sm');
            }, function (large_screen) {
	            $scope.large_screen = large_screen;
            });
            
        }
    };
}]);

/* istanbul ignore next */
navigation.directive('parlayToolbar', function () {
    return {
        templateUrl: '../parlay_components/navigation/directives/parlay-toolbar.html',
        controller: 'parlayToolbarController'
    };
});