var endpoints = angular.module('parlay.endpoints', ['ui.router', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main', 'parlay.protocols', 'promenade.broker', 'bit.endpoints']);

/* istanbul ignore next */
endpoints.config(function($stateProvider) {
    $stateProvider.state('endpoints', {
        url: '/endpoints',
        templateUrl: '../parlay_components/endpoints/views/base.html',
        controller: 'EndpointController'
    });
});

endpoints.factory('ParlayEndpoint', ['$injector', function ($injector) {
    return function ParlayEndpoint (endpoint, protocol) {
        
        var Public = {};
    
        var Private = {
            protocol: protocol,
            vendor_interfaces: []
        };
        
        Private.attachVendorInterfaces = function (endpoint) {
            endpoint.type.split("/").forEach(function (type) {
                try {
                    var instance = $injector.get(type);
                    Private.vendor_interfaces.push(new instance(endpoint, protocol));
                }
                catch (e) {
                    console.warn('Could not find ' + type + ' endpoint instance.');
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
        
        Public.matchesQuery = function (query) {
            return Private.vendor_interfaces.filter(function (vend_inter) {
                return vend_inter.hasOwnProperty('matchesQuery');
            }).some(function (vend_inter) {
                return vend_inter.matchesQuery(query);
            });
        };
        
        Public.getName = function () {
            return Private.vendor_interfaces.find(function (vend_inter) {
                return vend_inter.hasOwnProperty('getName');
            }).getName();
        };
        
        Public.activate = function () {
            protocol.activateEndpoint(Public);
        };
        
        Private.attachVendorInterfaces(endpoint);
        
        return Public;
    };
}]);

endpoints.factory('EndpointManager', ['PromenadeBroker', 'ProtocolManager', function (PromenadeBroker, ProtocolManager) {
    
    var Private = {};
    
    var Public = {};
    
    Public.getActiveEndpoints = function () {
        return ProtocolManager.getOpenProtocols().reduce(function (previous, current) {
            return previous.concat(current.getActiveEndpoints());
        }, []);
    };
    
    Public.getAvailableEndpoints = function () {
        return ProtocolManager.getOpenProtocols().reduce(function (previous, current) {
            return previous.concat(current.getAvailableEndpoints());
        }, []);
    };
    
    Public.requestDiscovery = function () {
        return PromenadeBroker.requestDiscovery(true);
    };
    
    Public.activateEndpoint = function (endpoint) {
        endpoint.activate();
    };
        
    return Public;
}]);

endpoints.controller('EndpointController', ['$scope', '$mdToast', '$mdDialog', 'EndpointManager', function ($scope, $mdToast, $mdDialog, EndpointManager) {
    
    $scope.isDiscovering = false;
    
    $scope.filterEndpoints = function () {
        return EndpointManager.getActiveEndpoints();
    };
    
    $scope.requestDiscovery = function () {
        $scope.isDiscovering = true;
        EndpointManager.requestDiscovery().then(function (result) {
            $scope.isDiscovering = false;
            
            var content_string;
            if (result.length === 0) {
                content_string = 'Successfully discovered 0 devices. Check protocol connections?';
            }
            else if (result.length === 1) {
                content_string = 'Successfully discovered ' + result[0].name + '.';
            }
            else {
                content_string = 'Successfully discovered ' + result.length + ' devices.';
            }
            
            $mdToast.show($mdToast.simple()
                .content(content_string)
                .position('bottom left'));
        });
    };
        
}]);

endpoints.controller('ParlayEndpointSearchController', ['$scope', 'EndpointManager', function ($scope, EndpointManager) {
            
    $scope.searching = false;
    $scope.search_icon = 'search';
    $scope.selected_item = null;
    
    $scope.selectEndpoint = function (endpoint) {
        // Change is detected after we set endpoint to null.
        if (endpoint === null) return;
        EndpointManager.activateEndpoint(endpoint);
        $scope.selected_item = null;
        $scope.search_text = null;
    };
    
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
        return query ? EndpointManager.getAvailableEndpoints().filter($scope.createFilterFor(query)) : EndpointManager.getAvailableEndpoints();
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
            
            var endpoints = scope.endpoint.getDirectives();
            
            // Append toolbar directives.
            endpoints.filter(function (endpoint) {
                return endpoint.hasOwnProperty('toolbar');
            }).reduce(function (previous, endpoint) {
                return previous.concat(endpoint.toolbar.map(function (directive) {
                    return '<' + snake_case(directive, '-') + ' endpoint="endpoint" layout-fill layout="row" layout-align="space-between center"></' + snake_case(directive, '-') + '>';    
                }));
            }, []).reverse().forEach(function (directive_string) {
                toolbar.appendChild($compile(directive_string)(scope)[0]);
            });
            
            // Append tabs directives.
            endpoints.filter(function (endpoint) {
                return endpoint.hasOwnProperty('tabs');
            }).reduce(function (previous, endpoint) {
                return previous.concat(endpoint.tabs.map(function (directive) {
                    return '<' + snake_case(directive, '-') + ' endpoint="endpoint"></' + snake_case(directive, '-') + '>';
                }));
            }, []).reverse().forEach(function (directive_string) {
                tabs.appendChild($compile(directive_string)(scope)[0]);
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