/**
 * @name EndpointsConfiguration
 * @param $stateProvider - Service provided by ui.router
 * @description
 * The EndpointsConfiguration sets up the endpoints state. The data object is passed with the display name and icon.
 */
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

angular.module("parlay.endpoints", ["ui.router", "parlay.endpoints.toolbar", "parlay.endpoints.controller"])
	.config(["$stateProvider", EndpointsConfiguration]);