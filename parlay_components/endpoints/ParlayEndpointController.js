var endpoint_controller = angular.module('parlay.endpoints.controller', ['parlay.endpoints.manager']);

endpoint_controller.controller('ParlayEndpointController', ['$scope', 'ParlayEndpointManager', function ($scope, ParlayEndpointManager) {
	    
    $scope.filterEndpoints = function () {
        return ParlayEndpointManager.getActiveEndpoints();
    };
    
    $scope.requestDiscovery = function () {
        ParlayEndpointManager.requestDiscovery();
    };
    
    $scope.reorder = function (index, distance) {
	    ParlayEndpointManager.reorder(parseInt(index, 10), distance);
    };
    
    $scope.deactivate = function (index) {
	    ParlayEndpointManager.deactivateEndpoint(parseInt(index, 10));
    };
	    
}]);