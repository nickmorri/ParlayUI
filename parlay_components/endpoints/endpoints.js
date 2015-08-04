var endpoints = angular.module('parlay.endpoints', ['ui.router', 'ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main', 'parlay.protocols', 'promenade.broker']);

/* istanbul ignore next */
endpoints.config(function($stateProvider) {
    $stateProvider.state('endpoints', {
        url: '/endpoints',
        templateUrl: '../parlay_components/endpoints/views/base.html',
        controller: 'EndpointController'
    });
});

endpoints.factory('ParlayEndpoint', function () {
    
    function NotImplementedError(method) {
        console.warn(method + ' is not implemented for ' + this.name);
    }
    
    function ParlayEndpoint(data, protocol) {
        
        var workspaceHashes = {};
        
        Object.defineProperty(this, 'name', {
            value: data.NAME,
            enumerable: true,
            writeable: false,
            configurable: false
        });
        
        Object.defineProperty(this, 'protocol', {
            value: protocol,
            writeable: false,
            enumerable: false,
            configurable: false
        });
        
        Object.defineProperty(this, 'workspaceHashes', {
	       	value: {},
	       	writeable: true,
	       	enumerable: false,
	       	configurable: false
        });
        
        this.type = 'ParlayEndpoint';
        
        this.interfaces = data.INTERFACES;
        
        this.directives = {
            toolbar: [],
            tabs: []
        };
        
    }
    
    ParlayEndpoint.prototype.getType = function () {
        return this.type;
    };
    
    ParlayEndpoint.prototype.getDirectives = function () {
        return [this.directives];
    };
    
    ParlayEndpoint.prototype.activate = function () {
        this.protocol.activateEndpoint(this);
    };
    
    ParlayEndpoint.prototype.deactivate = function () {
	    this.protocol.deactivateEndpoint(this);
    };
    
    ParlayEndpoint.prototype.reorder = function (index, distance) {
	    this.protocol.reorderEndpoint(this, index, distance);
    };
    
    ParlayEndpoint.prototype.getTrackById = function (index) {
	    if (!this.workspaceHashes[index]) this.workspaceHashes[index] = Math.floor(Math.random() * 10000);
	    return this.workspaceHashes[index];
    };
    
    ParlayEndpoint.prototype.adjustWorkSpaceHashes = function (index, distance) {
	    var temp = this.workspaceHashes[index + distance];
	    this.workspaceHashes[index + distance] = this.workspaceHashes[index];
	    if (temp) this.workspaceHashes[index] = temp;
	    else delete this.workspaceHashes[index];
	};
    
    ParlayEndpoint.prototype.matchesQuery = function (query) {
        NotImplementedError('matchesQuery');
    };
    
    return ParlayEndpoint;
    
});

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
    
    Public.deactivateEndpoint = function (endpoint) {
	    endpoint.deactivate();
    };
        
    return Public;
}]);

endpoints.controller('EndpointController', ['$scope', 'EndpointManager', function ($scope, EndpointManager) {
    
    $scope.filterEndpoints = function () {
        return EndpointManager.getActiveEndpoints();
    };
    
    $scope.requestDiscovery = function () {
        EndpointManager.requestDiscovery();
    };
    
    $scope.trackingFunction = function (endpoint, index) {
	    return endpoint.getTrackById(index);
    };
    
}]);

endpoints.controller('ParlayEndpointSearchController', ['$scope', 'EndpointManager', function ($scope, EndpointManager) {
            
    $scope.searching = false;
    $scope.selected_item = null;
    
    $scope.selectEndpoint = function (endpoint) {
        // Change is detected after we set endpoint to null.
        if (endpoint === null || endpoint === undefined) return;
        EndpointManager.activateEndpoint(endpoint);
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

/* istanbul ignore next */
endpoints.directive('parlayEndpointSearch', function () {
    return {
        scope: {},
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-search.html',
        controller: 'ParlayEndpointSearchController',
        link: function ($scope, element, attributes) {
            $scope.$watch('searching', function (newValue, oldValue, $scope) {
                $scope.search_icon = $scope.searching ? 'close' : 'search'; 
            });
        }
    };
});

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
            }, []).forEach(function (directive_string) {
	            toolbar.insertBefore($compile(directive_string)(scope)[0], toolbar.firstChild);
            });
            
            // Append tabs directives.
            endpoints.filter(function (endpoint) {
                return endpoint.hasOwnProperty('tabs');
            }).reduce(function (previous, endpoint) {
                return previous.concat(endpoint.tabs.map(function (directive) {
                    return '<' + snake_case(directive, '-') + ' endpoint="endpoint"></' + snake_case(directive, '-') + '>';
                }));
            }, []).forEach(function (directive_string) {
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