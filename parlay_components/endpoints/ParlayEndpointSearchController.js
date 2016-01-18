/**
 * Create filter function for a query string
 * @param {String} query - Name of endpoint to query by.
 */
function createFilterFor(query) {
    var lowercase_query = angular.lowercase(query);

    return function filterFn(endpoint) {
        return endpoint.matchesQuery(lowercase_query);
    };
}

function ParlayEndpointSearchController($scope, ParlayEndpointManager) {
            
    $scope.selected_item = null;
    $scope.search_text = null;
    
    this.selectEndpoint = function (endpoint) {
        // Change is detected after we set endpoint to null.
        if (endpoint === null || endpoint === undefined) return;
        ParlayEndpointManager.activateEndpoint(endpoint);
        $scope.selected_item = null;
        $scope.search_text = null;
    };

    /**
     * Search for endpoints.
     * @param {String} query - Name of endpoint to find.
     */
    this.querySearch = function(query) {
        return query ? ParlayEndpointManager.getAvailableEndpoints().filter(createFilterFor(query)) : ParlayEndpointManager.getAvailableEndpoints();
    };
    
    this.hasDiscovered = function () {
	    return ParlayEndpointManager.hasDiscovered();
    };
    
}

function ParlayEndpointSearch() {
    return {
        scope: {},
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-search.html',
        controller: 'ParlayEndpointSearchController',
        controllerAs: "ctrl"
    };
}

angular.module('parlay.endpoints.search', ['templates-main', 'parlay.endpoints.manager'])
	.controller('ParlayEndpointSearchController', ['$scope', 'ParlayEndpointManager', ParlayEndpointSearchController])
	.directive('parlayEndpointSearch', [ParlayEndpointSearch]);