var endpoint_controller = angular.module('parlay.endpoints.controller', ['parlay.endpoints.manager', 'parlay.endpoints.workspaces']);

endpoint_controller.controller('ParlayEndpointController', ['$scope', '$mdDialog', 'ParlayEndpointManager', function ($scope, $mdDialog, ParlayEndpointManager) {
	    
    $scope.filterEndpoints = function () {
        return ParlayEndpointManager.getActiveEndpoints();
    };
    
    $scope.hasEndpoints = function () {
	    return ParlayEndpointManager.hasActiveEndpoints();
    };
    
    $scope.requestDiscovery = function () {
        ParlayEndpointManager.requestDiscovery();
    };
    
    $scope.openWorkspaceManagementDialog = function (event) {
	    /* istanbul ignore next */
	    $mdDialog.show({
		    controller: 'ParlayWorkspaceManagementController',
		    templateUrl: '../parlay_components/endpoints/directives/parlay-workspace-management-dialog.html',
		    targetEvent: event,
		    clickOutsideToClose: true
	    });
    };
    
    $scope.reorder = function (index, distance) {
	    ParlayEndpointManager.reorder(parseInt(index, 10), distance);
    };
    
    $scope.duplicate = function (index, uid) {
	    ParlayEndpointManager.duplicateEndpoint(parseInt(index, 10), uid);
    };
    
    $scope.deactivate = function (index) {
	    ParlayEndpointManager.deactivateEndpoint(parseInt(index, 10));
    };
	    
}]);