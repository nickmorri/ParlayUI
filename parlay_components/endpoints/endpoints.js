var endpoints = angular.module('parlay.endpoints', ['ui.router', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main', 'parlay.protocols']);

/* istanbul ignore next */
endpoints.config(function($stateProvider) {
    $stateProvider.state('endpoints', {
        url: '/endpoints',
        templateUrl: '../parlay_components/endpoints/views/base.html',
        controller: 'endpointController'
    });
});

endpoints.factory('ParlayDevice', function () {
    
    var Private = {};
    var Public = {};
        
    Private.addDiscovery = function (data) {
        Private.endpoints = data.map(function (endpoint) {
            
            endpoint.type = endpoint.type.split("/");
            
            return endpoint;
        });
    };
        
    Public.getEndpoints = function () {
        return Private.endpoints;
    };
    
    Public.generateCommandMessage = function () {
        return {
            'topics': {
                'to_device': 0x84,
                'from_device': 0x01,
                'to_system': 0x00,
                'from_system': 0xf0,
                'to':0x0084,
                'from': 0xf001,
                'message_id': 200,
                'message_type': 0
            },
            'contents': {
                "command": 0x64, 
                'message_info': 0,
                "payload": {
                    "type": 0,
                    "data": []
                }
            }
        };
    };
    
    return function (data) {
        Private.addDiscovery(data);
        return Public;
    };
    
});

endpoints.factory('EndpointManager', ['PromenadeBroker', 'ParlayDevice', function (PromenadeBroker, ParlayDevice) {
    
    var Public = {};
    
    var Private = {
        devices: []
    };
    
    Public.getEndpoints = function () {
        var endpoints = [];
        Private.devices.forEach(function (device) {
            Array.prototype.push.apply(endpoints, device.getEndpoints());
        });
        return endpoints;
    };
    
    Public.requestDiscovery = function () {
        return PromenadeBroker.requestDiscovery(true);
    };
    
    PromenadeBroker.onDiscovery(function (response) {
        Private.devices = response.discovery.map(function (protocol) {
            return new ParlayDevice(protocol.children);
        });
    });
        
    return Public;
}]);

endpoints.controller('endpointController', ['$scope', '$mdToast', '$mdDialog', 'EndpointManager', function ($scope, $mdToast, $mdDialog, EndpointManager) {
    
    $scope.isDiscovering = false;
    
    $scope.filterEndpoints = function () {
        return EndpointManager.getEndpoints();
    };
    
    $scope.requestDiscovery = function () {
        $scope.isDiscovering = true;
        EndpointManager.requestDiscovery().then(function (result) {
            $scope.isDiscovering = false;
            $mdToast.show($mdToast.simple()
                .content('Discovery successful.')
                .position('bottom left').hideDelay(3000));
        });
    };
    
    $scope.doCommand = function (command) {
        debugger;
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