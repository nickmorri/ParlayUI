var endpoint_search = angular.module('parlay.endpoints.search', ['templates-main', 'parlay.endpoints.manager']);

endpoint_search.controller('ParlayEndpointSearchController', ['$scope', 'ParlayEndpointManager', function ($scope, ParlayEndpointManager) {
            
    $scope.searching = false;
    $scope.selected_item = null;
    
    $scope.selectEndpoint = function (endpoint) {
        // Change is detected after we set endpoint to null.
        if (endpoint === null || endpoint === undefined) return;
        ParlayEndpointManager.activateEndpoint(endpoint);
        $scope.selected_item = null;
        $scope.search_text = null;
    };
    
    /**
     * Display search bar and cleans state of search on close.
     */
    $scope.toggleSearch = function () {
        $scope.searching = !$scope.searching;
        if (!$scope.searching) $scope.search_text = null;
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
}]);

/* istanbul ignore next */
endpoint_search.directive('parlayEndpointSearch', ['$timeout', function ($timeout) {
    return {
        scope: {},
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-search.html',
        controller: 'ParlayEndpointSearchController',
        link: function ($scope, element, attributes) {
            $scope.$watch('searching', function (newValue, oldValue, $scope) {
                $scope.search_icon = $scope.searching ? 'close' : 'search';
                if ($scope.searching) $timeout(function () {
	                element.find('input').focus();
                });	                
            });
        }
    };
}]);