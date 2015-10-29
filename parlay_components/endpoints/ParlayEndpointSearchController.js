function ParlayEndpointSearchController($scope, ParlayEndpointManager) {
            
    $scope.selected_item = null;
    
    $scope.selectEndpoint = function (endpoint) {
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
    $scope.querySearch = function(query) {
        return query ? ParlayEndpointManager.getAvailableEndpoints().filter($scope.createFilterFor(query)) : ParlayEndpointManager.getAvailableEndpoints();
    };

    /**
     * Create filter function for a query string
     * @param {String} query - Name of endpoint to query by.
     */
    $scope.createFilterFor = function(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(endpoint) {
            return endpoint.matchesQuery(lowercaseQuery);
        };
    };
    
    $scope.hasDiscovered = function () {
	    return ParlayEndpointManager.hasDiscovered();
    };
    
}

function ParlayEndpointSearch($timeout) {
    return {
        scope: {},
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-search.html',
        controller: 'ParlayEndpointSearchController',
        link: function ($scope, element, attributes) {
            
			// Prevents random endpoints being added since the autofocus element is still focused.            
            $scope.$watch('selected_item', function (newValue, oldValue, $scope) {
	            // We just added a new endpoint to the workspace. So we should blur the input.
	        	if (newValue === null && oldValue !== null) element.find('input').blur();
	        });
            
        }
    };
}

angular.module('parlay.endpoints.search', ['templates-main', 'parlay.endpoints.manager'])
	.controller('ParlayEndpointSearchController', ['$scope', 'ParlayEndpointManager', ParlayEndpointSearchController])
	.directive('parlayEndpointSearch', ['$timeout', ParlayEndpointSearch]);