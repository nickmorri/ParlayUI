var endpoints = angular.module('parlay.endpoints', ['ui.router', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main', 'promenade.broker', 'parlay.protocols', 'bit.sscom']);

/* istanbul ignore next */
endpoints.config(function($stateProvider) {
    $stateProvider.state('endpoints', {
        url: '/endpoints',
        templateUrl: '../parlay_components/endpoints/views/base.html',
        controller: 'endpointController'
    });
});

endpoints.factory('parlayEndpoint', function () {
    var Public = {};
    var Private = {};
    
    return Public;
});

endpoints.factory('EndpointManager', ['$injector', 'PromenadeBroker', function ($injector, PromenadeBroker) {
    
    var Public = {};
    
    var Private = {
        endpoints: [],
        broker: PromenadeBroker
    };
    
    Public.getEndpoints = function () {
        return Private.endpoints;
    };
        
    Public.setupEndpoint = function (type) {
        return $injector.get(type).setup();
    };
    
    Public.disconnectEndpoint = function (index) {
        endpoint.disconnect();
    };
    
    Public.reconnectEndpoint = function(endpoint) {
        endpoint.connect();
    };
    
    /*
Private.broker.requestDiscoveryDemo().then(function (endpoints) {
        Private.endpoints = endpoints;
    });
*/
        
    return Public;
}]);

endpoints.controller('endpointController', ['$scope', '$mdToast', '$mdDialog', 'EndpointManager', function ($scope, $mdToast, $mdDialog, EndpointManager) {
    $scope.endpointManager = EndpointManager;
    
    $scope.filterEndpoints = function () {
        return EndpointManager.getEndpoints();
    };
    
    /**
     * Show protocol configuration dialog and have EndpointManager open a protocol.
     * @param {Event} - Event generated when button is selected. Allows use to have origin for dialog display animation.
     */
    $scope.configureProtocol = function (event) {
        // Show a configuraton dialog allowing us to setup a protocol configuration.
        $mdDialog.show({
            targetEvent: event,
            controller: 'ProtocolConfigurationController',
            templateUrl: '../parlay_components/endpoints/directives/parlay-protocol-configuration-dialog.html',
        }).then(function (configuration) {
            // If configuration is undefined that means we hide the dialog without generating a configuration and should not attempt opening.
            if (configuration !== undefined) return $scope.endpointManager.openProtocol(configuration);
            else return undefined;
        }).then(function (response) {
            // Don't display anything if we didn't open a protocol.
            if (response === undefined) return;
            $mdToast.show($mdToast.simple()
                .content('Connected successfully to protocol.')
                .position('bottom left').hideDelay(3000));
        }, function (response) {
            $mdToast.show($mdToast.simple()
                .content('Failed to make protocol connection.')
                .position('bottom left').hideDelay(3000));
        });
    };
    
    // Do endpoint setup
    $scope.setupEndpoint = function () {
        $scope.endpointManager.setupEndpoint();
    };
    
    // Reconnect endpoint if we become disconnected and user requests reconnection
    $scope.reconnectEndpoint = function (index) {
        $scope.endpointManager.reconnectEndpoint(index);
    };
    
    // Disconnect endpoint when user asks
    $scope.disconnectEndpoint = function (index) {
        $scope.endpointManager.disconnectEndpoint(index).then(function (endpoint) {
            // Display toast alert notifying user of lost connection
            $mdToast.show($mdToast.simple()
                .content('Disconnected ' + endpoint.name)
                .action('Reconnect').highlightAction(true)
                .position('bottom left').hideDelay(3000)).then(function () {
                    $scope.reconnectEndpoint(endpoint);
                });
        });        
    };
    
}]);

endpoints.controller('ParlayEndpointSearchController', ['$scope', 'EndpointManager', function ($scope, EndpointManager) {
            
    $scope.searching = false;
    $scope.search_text = null;
    $scope.search_icon = 'search';
    $scope.selected_item = null;
    
    /**
     * Display search bar and cleans state of search on close.
     */
    $scope.toggleSearch = function () {
        $scope.searching = !$scope.searching;
        if (!$scope.searching) {
            $scope.search_text = null;
            $scope.search_icon = 'search';
        }
        else {
            $scope.search_icon = 'close';
        }
    };

    /**
     * Search for endpoints.
     * @param {String} query - Name of endpoint to find.
     */
    $scope.querySearch = function(query) {
        return query ? EndpointManager.getEndpoints().filter($scope.createFilterFor(query)) : EndpointManager.getEndpoints();
    };

    /**
     * Create filter function for a query string
     * @param {String} query - Name of endpoint to query by.
     */
    $scope.createFilterFor = function(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(endpoint) {
            return angular.lowercase(endpoint.name).indexOf(lowercaseQuery) >= 0;
        };
    };
}]);

endpoints.directive('parlayEndpointSearch', function () {
    return {
        scope: {},
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-search.html',
        controller: 'ParlayEndpointSearchController'
    };
});

/* istanbul ignore next */
endpoints.directive('parlayEndpointCard', function () {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-card.html'
    };
});

/* istanbul ignore next */
endpoints.directive('parlayEndpointsToolbar', function () {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoints-toolbar.html'
    };
});