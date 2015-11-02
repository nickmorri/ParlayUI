function ParlayConnectionStatusController($scope, $mdDialog) {
    /* istanbul ignore next */
    $scope.viewConnections = function (event) {
        $mdDialog.show({
            targetEvent: event,
            clickOutsideToClose: true,
            controller: 'ParlayConnectionListController',
            templateUrl: '../parlay_components/communication/directives/parlay-connection-list-dialog.html'
        });
    };    
    
}

function ParlayConnectionStatus(PromenadeBroker, $mdMedia) {
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
}

angular.module('parlay.navigation', ['ngAnimate', 'ui.router', 'ngMaterial', 'ngMdIcons', 'promenade.broker', 'parlay.protocols.list_controller', 'templates-main'])
	.controller('ParlayConnectionStatusController', ['$scope', '$mdDialog', ParlayConnectionStatusController])
	.directive('parlayConnectionStatus', ['PromenadeBroker', '$mdMedia', ParlayConnectionStatus]);