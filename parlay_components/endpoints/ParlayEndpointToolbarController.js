function ParlayEndpointsToolbarController($scope, $mdDialog, $mdSidenav, ParlayEndpointManager) {
	
	this.openSidenav = function () {
		/* istanbul ignore next */
		$mdSidenav("navigation").open();
	};
	
	this.requestDiscovery = function () {
        ParlayEndpointManager.requestDiscovery();
    };
    
    this.openWorkspaceManagementDialog = function (event) {
	    /* istanbul ignore next */
	    $mdDialog.show({
		    templateUrl: "../parlay_components/endpoints/directives/parlay-workspace-management-dialog.html",
		    targetEvent: event,
		    controller: "ParlayWorkspaceManagementController",
		    clickOutsideToClose: true
	    });
    };
    
    this.openConnectionManagementDialog = function (event) {
	    /* istanbul ignore next */
        $mdDialog.show({
            templateUrl: "../parlay_components/communication/directives/parlay-connection-list-dialog.html",
            targetEvent: event,
            controller: "ParlayConnectionListController",
            clickOutsideToClose: true
        });
    };
    
}

function ParlayEndpointsToolbar($mdMedia, PromenadeBroker) {
    return {
	    scope: {},
	    replace: true,
        templateUrl: "../parlay_components/endpoints/directives/parlay-endpoint-toolbar.html",
        link: function ($scope, element, attributes) {
	        
	        // Watch our connection status to Broker and update the icon if connectivity changes.
	        $scope.$watch(function () {
                return PromenadeBroker.isConnected();
            }, function (connected) {
	            $scope.connected = connected;
            });
	        
	        // Watch the size of the screen, if we are on a screen size that's greater than a small screen we should always display labels.
            $scope.$watch(function () {
	            return $mdMedia("gt-md");
            }, function (large_screen) {
	            $scope.large_screen = large_screen;
            });
            
        },
        controller: "ParlayEndpointsToolbarController",
        controllerAs: "ctrl"
    };
}

angular.module("parlay.endpoints.toolbar", ["parlay.protocols.list_controller", "parlay.sidenav", "parlay.endpoints.search"])
	.controller("ParlayEndpointsToolbarController", ["$scope", "$mdDialog", "$mdSidenav", "ParlayEndpointManager", ParlayEndpointsToolbarController])
	.directive("parlayEndpointsToolbar", ["$mdMedia", "PromenadeBroker", ParlayEndpointsToolbar]);