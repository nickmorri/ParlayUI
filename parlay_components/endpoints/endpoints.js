function EndpointsConfiguration($stateProvider) {
    $stateProvider.state("endpoints", {
        url: "/endpoints",
        templateUrl: "../parlay_components/endpoints/views/base.html",
        controller: "ParlayEndpointController",
        controllerAs: "endpointCtrl",
        data: {
	        display: "Endpoints",
			icon: "dashboard"
		}
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

angular.module("parlay.endpoints", ["ui.router", "parlay.endpoints.manager", "parlay.endpoints.toolbar"])
	.config(["$stateProvider", EndpointsConfiguration])
	.controller("ParlayEndpointController", ["$scope", "ParlayEndpointManager", ParlayEndpointController]);