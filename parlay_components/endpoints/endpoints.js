function EndpointsConfiguration($stateProvider) {
    $stateProvider.state("endpoints", {
        url: "/endpoints",
        templateUrl: "../parlay_components/endpoints/views/base.html",
        controller: "ParlayEndpointController",
        controllerAs: "endpointCtrl"
    });
}

function ParlayEndpointController($scope, ParlayEndpointManager) {
	
	this.filterEndpoints = function () {
        return ParlayEndpointManager.getActiveEndpoints();
    };
    
    this.hasEndpoints = function () {
	    return ParlayEndpointManager.hasActiveEndpoints();
    };
    
    this.reorder = function (index, distance) {
	    ParlayEndpointManager.reorder(parseInt(index, 10), distance);
    };
    
    this.duplicate = function (index, uid) {
	    ParlayEndpointManager.duplicateEndpoint(parseInt(index, 10), uid);
    };
    
    this.deactivate = function (index) {
	    ParlayEndpointManager.deactivateEndpoint(parseInt(index, 10));
    };
	    
}

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
        templateUrl: "../parlay_components/endpoints/directives/parlay-endpoints-toolbar.html",
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

angular.module("parlay.endpoints", ["ui.router", "parlay.endpoints.manager", "parlay.endpoints.search", "parlay.endpoints.endpoint", "parlay.protocols.list_controller", "parlay.sidenav"])
	.config(["$stateProvider", EndpointsConfiguration])
	.controller("ParlayEndpointsToolbarController", ["$scope", "$mdDialog", "$mdSidenav", "ParlayEndpointManager", ParlayEndpointsToolbarController])
	.controller("ParlayEndpointController", ["$scope", "ParlayEndpointManager", ParlayEndpointController])
	.directive("parlayEndpointsToolbar", ["$mdMedia", "PromenadeBroker", ParlayEndpointsToolbar]);