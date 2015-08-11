var parlay_endpoint = angular.module('parlay.endpoints.endpoint', ['ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main']);

parlay_endpoint.factory('ParlayEndpoint', function () {
    
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
    
    ParlayEndpoint.prototype.matchesQuery = function (query) {
        NotImplementedError('matchesQuery');
    };
    
    return ParlayEndpoint;
    
});

parlay_endpoint.directive('parlayEndpointCard', ['$compile', function ($compile) {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-card.html',
        link: function (scope, element, attributes) {
            
            scope.endpoint = scope.container.ref;
            
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