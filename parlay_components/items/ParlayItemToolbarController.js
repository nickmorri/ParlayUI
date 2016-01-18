function ParlayItemsToolbarController($mdDialog, $mdSidenav, ParlayItemManager) {
	
	this.openSidenav = function () {
		/* istanbul ignore next */
		$mdSidenav("navigation").open();
	};
	
	this.requestDiscovery = function () {
        ParlayItemManager.requestDiscovery();
    };
    
    this.openWorkspaceManagementDialog = function (event) {
	    /* istanbul ignore next */
	    $mdDialog.show({
		    templateUrl: "../parlay_components/items/directives/parlay-workspace-management-dialog.html",
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
            controllerAs: "ctrl",
            clickOutsideToClose: true
        });
    };
    
}

function ParlayItemsToolbar($mdMedia, PromenadeBroker) {
    return {
	    scope: {},
	    replace: true,
        templateUrl: "../parlay_components/items/directives/parlay-item-toolbar.html",
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
        controller: "ParlayItemsToolbarController",
        controllerAs: "ctrl"
    };
}

angular.module("parlay.items.toolbar", ["parlay.protocols.list_controller", "parlay.sidenav", "parlay.items.search"])
	.controller("ParlayItemsToolbarController", ["$mdDialog", "$mdSidenav", "ParlayItemManager", ParlayItemsToolbarController])
	.directive("parlayItemsToolbar", ["$mdMedia", "PromenadeBroker", ParlayItemsToolbar]);