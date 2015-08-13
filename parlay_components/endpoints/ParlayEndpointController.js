var endpoint_controller = angular.module('parlay.endpoints.controller', ['parlay.endpoints.manager', 'parlay.endpoints.workspaces']);

endpoint_controller.controller('ParlayEndpointController', ['$scope', '$mdDialog', 'ParlayEndpointManager', 'ParlayLocalStore', function ($scope, $mdDialog, ParlayEndpointManager, ParlayLocalStore) {
	    
    $scope.filterEndpoints = function () {
        return ParlayEndpointManager.getActiveEndpoints();
    };
    
    $scope.hasEndpoints = function () {
	    return ParlayEndpoint.hasActiveEndpoints();
    };
    
    $scope.requestDiscovery = function () {
        ParlayEndpointManager.requestDiscovery();
    };
    
    $scope.reorder = function (index, distance) {
	    ParlayEndpointManager.reorder(parseInt(index, 10), distance);
    };
    
    $scope.duplicate = function (index) {
	    ParlayEndpointManager.duplicateEndpoint(parseInt(index, 10));
    };
    
    $scope.deactivate = function (index) {
	    ParlayEndpointManager.deactivateEndpoint(parseInt(index, 10));
    };
    
    $scope.saveWorkspace = function () {
	    ParlayLocalStore('endpoints').packagePrefix('test');
    };
    
    $scope.openWorkspaceManagementDialog = function (event) {
	    $mdDialog.show({
		    controller: 'WorkspaceManagementController',
		    templateUrl: '../parlay_components/endpoints/directives/parlay-workspace-management-dialog.html',
		    targetEvent: event,
		    clickOutsideToClose: true
	    });
    };
	    
}]);