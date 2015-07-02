var endpoints = angular.module('parlay.endpoints', ['ui.router', 'ngMaterial', 'ngMdIcons', 'templates-main', 'promenade.broker', 'bit.sscom']);

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
    
    var Public = {
        protocols: [],
        endpoints: []
    };
    
    var Private = {
        broker: PromenadeBroker
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
    
    Private.broker.requestProtocols().then(function (response) {
        Public.protocols = Object.keys(response).map(function (protocol_name) {
            var protocol = response[protocol_name];
            
            protocol.name = protocol_name;
            
            return protocol;
        }, response);
    });
        
    return Public;
}]);

endpoints.controller('endpointController', ['$scope', '$mdToast', '$mdDialog', 'EndpointManager', function ($scope, $mdToast, $mdDialog, EndpointManager) {
    $scope.endpointManager = EndpointManager;
    
    $scope.searching = false;
    $scope.search_icon = 'search';
    $scope.toggleSearch = function () {
        $scope.searching = !$scope.searching;
        if (!$scope.searching) {
            $scope.searchText = null;
            $scope.search_icon = 'search';
        }
        else {
            $scope.search_icon = 'close';
        }
    };
    $scope.selectedItem = null;

    /**
     * Search for endpoints.
     */
    $scope.querySearch = function(query) {
      return query ? $scope.endpointManager.active_endpoints.filter($scope.createFilterFor(query)) : $scope.endpoints;
    };

    /**
     * Create filter function for a query string
     */
    $scope.createFilterFor = function(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(endpoint) {
        return (endpoint._lowername.indexOf(lowercaseQuery) === 0) ||
            (endpoint._lowertype.indexOf(lowercaseQuery) === 0);
      };

    };
    
    // Default to display endpoint cards
    $scope.displayCards = true;
    $scope.display_icon = 'now_widgets';
    
    $scope.$watch('displayCards', function (previous, current) {
        if (previous) $scope.display_icon = 'now_widgets';
        else $scope.display_icon = 'list';
    });
    
    $scope.configureProtocol = function () {
        $mdDialog.show({
            controller: 'ProtocolConfigurationController',
            templateUrl: '../parlay_components/endpoints/directives/parlay-protocol-configuration-dialog.html',
        }).then(function (configuration) {
            // Do setup
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

endpoints.controller('ProtocolConfigurationController', ['$scope', '$mdDialog', 'EndpointManager', function ($scope, $mdDialog, EndpointManager) {
    
    $scope.protocols = angular.copy(EndpointManager.protocols);
    
    $scope.configuration = {};
    
    $scope.selectProtocol = function (protocol) {
        $scope.configuration.protocol = protocol;
        debugger;
    };
    
    $scope.hide = function () {
        $mdDialog.hide();
    };
    
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    
    $scope.accept = function () {
        $mdDialog.hide($scope.configuration);
    };
    
}]);

/* istanbul ignore next */
endpoints.directive('parlayEndpointCardItem', function () {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-card-item.html'
    };
});

/* istanbul ignore next */
endpoints.directive('parlayEndpointListItem', function () {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-list-item.html'
    };
});

/* istanbul ignore next */
endpoints.directive('parlayEndpointsToolbar', function () {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoints-toolbar.html'
    };
});