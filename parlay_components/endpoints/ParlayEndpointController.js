/**
 * @name ParlayEndpointController
 * @param ParlayEndpointManager - Service that manages the available endpoints.
 * @description
 * The ParlayEndpointController is a controller that manages the endpoints currently active in the workspace.
 *
 */
function ParlayEndpointController(ParlayEndpointManager) {

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

angular.module("parlay.endpoints.controller", ["parlay.endpoints.manager"])
    .controller("ParlayEndpointController", ["ParlayEndpointManager", ParlayEndpointController]);