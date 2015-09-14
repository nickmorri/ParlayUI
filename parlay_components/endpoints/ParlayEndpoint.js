var parlay_endpoint = angular.module('parlay.endpoints.endpoint', ['ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main', 'parlay.store.persistence', 'parlay.utility']);

parlay_endpoint.factory('ParlayEndpoint', function () {
    
    function ParlayEndpoint(data, protocol) {
        
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
	    console.warn('matchesQuery is not implemented for ' + this.name);
    };
    
    return ParlayEndpoint;
    
});

parlay_endpoint.directive('parlayEndpointCard', ['$compile', 'ParlayPersistence', 'ParlayUtility', function ($compile, ParlayPersistence, ParlayUtility) {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-card.html',
        link: function (scope, element, attributes) {
	        
	        // Grab the endpoint reference from the container for convience of using scope.endpoint.
	        scope.endpoint = scope.container.ref;
            
            var directive_name = 'parlayEndpointCard.' + scope.endpoint.name.replace(' ', '_') + '_' + scope.container.uid;
            
            // Using ParlayPersistence we will first attempt to restore these values then we will record them to ParlayStore.
            ParlayPersistence.monitor(directive_name, "$index", scope);
            ParlayPersistence.monitor(directive_name, "active_tab_index", scope);
            
            /**
	         * Compiles the toolbar set on the endpoint.
	         * @param {Array} directives - Array of directive name strings.
	         */
            function compileToolbar(directives) {
	            // Locate toolbar where we are going to insert dynamic directives.
	            var toolbar = element[0].querySelector('div.md-toolbar-tools');
	            
	            directives.filter(function (endpoint) {
	                return endpoint.hasOwnProperty('toolbar');
	            }).reduce(function (previous, endpoint) {
	                return previous.concat(endpoint.toolbar.map(function (directive) {
	                    return '<' + ParlayUtility.snakeCase(directive, '-') + ' endpoint="endpoint" layout-fill layout="row" layout-align="space-between center"></' + ParlayUtility.snakeCase(directive, '-') + '>';    
	                }));
	            }, []).forEach(function (directive_string) {
					toolbar.insertBefore($compile(directive_string)(scope)[0], toolbar.firstChild);
	            });
            }
            
            /**
	         * Compiles the tabs set on the endpoint.
		     * @param {Array} directives - Array of directive name strings.
	         */
            function compileTabs(directives) {
	            // Locate tabs where we are going to insert dynamic directives.
	            var tabs = element[0].querySelector('md-tabs');
	            
	            // Append tabs directives.
	            directives.filter(function (endpoint) {
	                return endpoint.hasOwnProperty('tabs');
	            }).reduce(function (previous, endpoint) {
		            return previous.concat(endpoint.tabs.map(function (directive) {
	                    return '<' + ParlayUtility.snakeCase(directive, '-') + ' endpoint="endpoint"></' + ParlayUtility.snakeCase(directive, '-') + '>';
	                }));
	            }, []).forEach(function (directive_string) {
	                tabs.appendChild($compile(directive_string)(scope)[0]);
	            });
            }
            
            // Grab the directives from the endpoint and compile them.
            var directives = scope.endpoint.getDirectives();
            compileToolbar(directives);
	        compileTabs(directives);
            
        }
    };
}]);