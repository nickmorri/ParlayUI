var endpoints = angular.module('parlay.endpoints', ['ui.router', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main', 'promenade.broker', 'bit.sscom']);

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
        open_protocols: [],
        endpoints: []
    };
    
    var Private = {
        available_protocols: [],
        broker: PromenadeBroker
    };
    
    Public.getAvailableProtocols = function () {
        return angular.copy(Private.available_protocols);
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
    
    Public.openProtocol = function (configuration) {
        return Private.broker.openProtocol(configuration).then(function (response) {
            return Public.open_protocols.push(configuration.protocol);
        });
    };
    
    Public.closeProtocol = function (protocol) {
        return Private.broker.closeProtocol(protocol).then(function (response) {
            return Public.open_protocols.splice(Public.open_protocols.findIndex(function (protocol) {
                return protocol.name === this.name;
            }, this), 1);
        });
    };
    
    Private.broker.requestDiscovery().then(function (endpoints) {
        debugger;
    });
    
    Private.broker.requestProtocols().then(function (protocols) {
        Private.available_protocols = protocols;
    });
        
    return Public;
}]);

endpoints.controller('endpointController', ['$scope', '$mdToast', '$mdDialog', 'EndpointManager', function ($scope, $mdToast, $mdDialog, EndpointManager) {
    $scope.endpointManager = EndpointManager;
    
    // Default to display endpoint cards
    $scope.displayCards = true;
    
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

endpoints.controller('ProtocolConnectionController', ['$scope', '$mdDialog', '$mdToast', 'EndpointManager', function ($scope, $mdDialog, $mdToast, EndpointManager) {
    $scope.hide = $mdDialog.hide;
    $scope.open_protocols = EndpointManager.open_protocols;
    
    /**
     * Closes protocol then spawns toast notifying user.
     * @param {Object} protocol - Protocol configuration object.
     */
    $scope.closeProtocol = function (protocol) {
        EndpointManager.closeProtocol(protocol).then(function (result) {
            $mdToast.show($mdToast.simple()
                .content('Closed ' + protocol.name + "."));
        }, function (result) {
            
        });
    };
    
    /**
     * Show protocol configuration dialog and have EndpointManager open a protocol.
     * @param {Event} - Event generated when button is selected. Allows use to have origin for dialog display animation.
     */
    $scope.openConfiguration = function (event) {
        $mdDialog.hide();
        // Show a configuraton dialog allowing us to setup a protocol configuration.
        $mdDialog.show({
            targetEvent: event,
            controller: 'ProtocolConfigurationController',
            templateUrl: '../parlay_components/endpoints/directives/parlay-protocol-configuration-dialog.html',
        }).then(function (configuration) {
            // If configuration is undefined that means we hide the dialog without generating a configuration and should not attempt opening.
            if (configuration !== undefined) return EndpointManager.openProtocol(configuration);
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
    
}]);

endpoints.controller('ProtocolConfigurationController', ['$scope', '$mdDialog', 'EndpointManager', function ($scope, $mdDialog, EndpointManager) {
    var protocols = EndpointManager.getAvailableProtocols().map(function (protocol) {
        return {
            name: protocol.name,
            parameters: protocol.params.reduce(function (param_obj, current_param) {
                param_obj[current_param] = protocol.defaults[current_param];
                return param_obj;
            }, {})
        };
    });
    
    $scope.configuration = {};
    
    $scope.selectProtocol = function (protocol) {
        $scope.configuration.protocol = protocol;
    };
    
    $scope.searchText = "";
    $scope.selectedItem = null;
    
    $scope.querySearch = function (query) {
        return protocols.filter(filterFunction(query));
    };
    
    function filterFunction(query) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(protocol) {
            return angular.lowercase(protocol.name).indexOf(lowercaseQuery) >= 0;
        };
    }
    
    $scope.cancel = function () {
        $mdDialog.hide();
    };
    
    $scope.accept = function () {
        $mdDialog.hide($scope.configuration);
    };
    
}]);

endpoints.controller('ParlayEndpointSearchController', ['$scope', 'EndpointManager', function ($scope, EndpointManager) {
            
    $scope.searching = false;
    $scope.search_icon = 'search';
    
    /**
     * Display search bar and cleans state of search on close.
     */
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
     * @param {String} query - Name of endpoint to find.
     */
    $scope.querySearch = function(query) {
      return query ? EndpointManager.active_endpoints.filter($scope.createFilterFor(query)) : $scope.endpoints;
    };

    /**
     * Create filter function for a query string
     * @param {String} query - Name of endpoint to query by.
     */
    $scope.createFilterFor = function(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(endpoint) {
        return (endpoint._lowername.indexOf(lowercaseQuery) === 0) ||
            (endpoint._lowertype.indexOf(lowercaseQuery) === 0);
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

endpoints.directive('parlayEndpointDisplaySwitch', function () {
    return {
        scope: {
            displayCards: "="
        },
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-display-switch.html',
        link: function ($scope, element, attributes) {
            
            $scope.display_icon = 'now_widgets';
            
            $scope.$watch('displayCards', function (previous, current) {
                if (previous) $scope.display_icon = 'now_widgets';
                else $scope.display_icon = 'list';
            });
        }
    };
});

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