var endpoints = angular.module('parlay.endpoints', ['ui.router', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main', 'parlay.protocols', 'bit.endpoints']);

/* istanbul ignore next */
endpoints.config(function($stateProvider) {
    $stateProvider.state('endpoints', {
        url: '/endpoints',
        templateUrl: '../parlay_components/endpoints/views/base.html',
        controller: 'endpointController'
    });
});

endpoints.factory('ParlayEndpoint', ['$injector', function ($injector) {
    return function ParlayEndpoint (endpoint) {
        
        var Public = {};
    
        var Private = {
            vendor_interfaces: []
        };
        
        Private.attachVendorInterfaces = function (endpoint) {
            endpoint.type.split("/").forEach(function (type) {
                try {
                    var instance = $injector.get(type);
                    Private.vendor_interfaces.push(new instance(endpoint));
                }
                catch (e) {
                    // Do nothing if we couldn't find that interface.
                }                
            });
        };
        
        Public.getVendorInterface = function (type) {
            return Private.vendor_interfaces.find(function (interface) {
                return type === interface.getType();
            });
        };
        
        Public.getTypes = function () {
            return Private.vendor_interfaces.map(function (endpoint) {
                return endpoint.getType();
            });
        };
        
        Public.getDirectives = function () {
            return Private.vendor_interfaces.map(function (endpoint) {
                return endpoint.getDirectives();
            }).filter(function (directive_set) {
                return Object.keys(directive_set).length;
            });
        };
        
        Private.attachVendorInterfaces(endpoint);
        
        return Public;
    };
}]);

endpoints.factory('ParlayDevice', ['ParlayEndpoint', function (ParlayEndpoint) {
    return function ParlayDevice (protocol) {

        var Private = {};

        var Public = {};
            
        Private.addDiscovery = function (data) {
            Private.endpoints = data.map(function (endpoint) {
                return new ParlayEndpoint(endpoint);
            });
        };
            
        Public.getEndpoints = function () {
            return Private.endpoints;
        };

        Private.addDiscovery(protocol.children);
        
        return Public;
    };    
}]);

endpoints.factory('EndpointManager', ['PromenadeBroker', 'ParlayDevice', 'ProtocolManager', function (PromenadeBroker, ParlayDevice, ProtocolManager) {
    
    var Public = {};
    
    var Private = {
        devices: []
    };
    
    Private.clearDevices = function () {
        Private.devices = [];
    };
    
    Public.getEndpoints = function () {
        return Private.devices.reduce(function (previous, current) {
            return previous.concat(current.getEndpoints());
        }, []);
    };
    
    Public.requestDiscovery = function () {
        return PromenadeBroker.requestDiscovery(true);
    };
    
    PromenadeBroker.onDiscovery(function (response) {
        Private.devices = response.discovery.map(function (protocol) {
            return new ParlayDevice(protocol);
        });
    });
    
    PromenadeBroker.onClose(function () {
        
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
                .position('bottom left'));
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
endpoints.directive('parlayEndpointCard', ['$compile', function ($compile) {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-card.html',
        link: function (scope, element, attributes) {
            
            // Converts directive names to snake-case which Angular requires during directive compilation.
            function snake_case(name) {
                return name.replace(/[A-Z]/g, function(letter, pos) {
                    return (pos ? '-' : '') + letter.toLowerCase();
                });
            }
            
            // Locate locations where we are going to insert dynamic directives.
            var toolbar = element[0].querySelector('div.md-toolbar-tools');
            var tabs = element[0].querySelector('md-tabs');
            
            var directives = scope.endpoint.getDirectives();
            
            // Append toolbar directives.
            directives.filter(function (directive) {
                return directive.hasOwnProperty('toolbar');
            }).map(function (directive) {
                return '<' + snake_case(directive.toolbar, '-') + ' endpoint="endpoint" layout-fill layout="row" layout-align="space-between center"></' + snake_case(directive.toolbar, '-') + '>';
            }).forEach(function (directiveString) {
                toolbar.appendChild($compile(directiveString)(scope)[0]);
            });
            
            // Append info directives.
            directives.filter(function (directive) {
                return directive.hasOwnProperty('info');
            }).map(function (directive) {
                return '<' + snake_case(directive.info, '-') + ' endpoint="endpoint"></' + snake_case(directive.info, '-') + '>';
            }).forEach(function (directiveString) {
                tabs.appendChild($compile(directiveString)(scope)[0]);
            });
            
        }
    };
}]);

/* istanbul ignore next */
endpoints.directive('parlayEndpointsToolbar', function () {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoints-toolbar.html'
    };
});