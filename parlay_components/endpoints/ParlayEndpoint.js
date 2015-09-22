var parlay_endpoint = angular.module('parlay.endpoints.endpoint', ['ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main', 'parlay.store.persistence', 'parlay.utility', 'parlay.endpoints.widgettab']);

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
            toolbar: {
	            default: [],
	            available: []
            },
            tabs: {
	            default: [],
	            available: []
            },
            available_cache_valid: false,
            available_cached: {}
        };
        
        this.addDefaultDirective({tabs: ["parlayWidgetTab"]});
        
    }
    
    ParlayEndpoint.prototype.getType = function () {
        return this.type;
    };
    
    ParlayEndpoint.prototype.addDefaultDirective = function (directives) {
	    var endpoint = this;
	    Object.keys(directives).forEach(function (target) {
		    directives[target].forEach(function (directive) {
			    endpoint.directives[target].default.push(directive);
		    });
	    });
    };
    
    ParlayEndpoint.prototype.getDefaultDirectives = function () {
	    var endpoint = this;
	    return Object.keys(endpoint.directives).reduce(function (accumulator, target) {
		    if (endpoint.directives[target].hasOwnProperty("default")) {
			    accumulator[target] = endpoint.directives[target].default;
		    }
		    return accumulator;
	    }, {});
    };
    
    ParlayEndpoint.prototype.addAvailableDirective = function (directives) {
	    this.directives.available_cache_valid = false;
	    
	    var endpoint = this;
	    Object.keys(directives).forEach(function (target) {
		    directives[target].forEach(function (directive) {
			    endpoint.directives[target].available.push(directive);
		    });
	    });
    };
    
    ParlayEndpoint.prototype.getAvailableDirectives = function () {
        if (!this.directives.available_cache_valid) {
	        var endpoint = this;
	    	endpoint.directives.available_cached = Object.keys(endpoint.directives).filter(function (target) {
				return target.indexOf("cache") === -1;
			}).reduce(function (accumulator, target) {
		        accumulator[target] = endpoint.directives[target].available;
		        return accumulator;
	        }, {});
	        endpoint.directives.available_cache_valid = true;    
        }
        return this.directives.available_cached;
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
	        
	        scope.active_directives = {};
	        
	        scope.activateDirective = function (target, directive) {
				if (target === "tabs") compileTabs([directive]);
				else if (target === "toolbar") compileToolbar([directive]);
				
				if (!scope.active_directives.hasOwnProperty(target)) {
					scope.active_directives[target] = [];
				}
				scope.active_directives[target].push(directive);
			};
			
			scope.deactivateDirective = function (target, directive) {
				
			};
	        
	        // Grab the endpoint reference from the container for convience of using scope.endpoint.
	        scope.endpoint = scope.container.ref;
            
            var directive_name = 'parlayEndpointCard.' + scope.endpoint.name.replace(' ', '_') + '_' + scope.container.uid;
            
            // Using ParlayPersistence we will first attempt to restore these values then we will record them to ParlayStore.
            ParlayPersistence.monitor(directive_name, "$index", scope);
            ParlayPersistence.monitor(directive_name, "active_tab_index", scope);
            ParlayPersistence.monitor(directive_name, "active_directives", scope);
            
            /**
	         * Compiles the toolbar set on the endpoint.
	         * @param {Array} directives - Array of directive name strings.
	         */
            function compileToolbar(directives) {
	            // Locate toolbar where we are going to insert dynamic directives.
	            var toolbar = element[0].querySelector('div.md-toolbar-tools');
	            
	            directives.map(function (directive) {
                    return '<' + ParlayUtility.snakeCase(directive, '-') + ' endpoint="endpoint" layout-fill layout="row" layout-align="space-between center"></' + ParlayUtility.snakeCase(directive, '-') + '>';    
                }).forEach(function (directive_string) {
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
	            
	            directives.map(function (directive) {
					return '<' + ParlayUtility.snakeCase(directive, '-') + ' endpoint="endpoint"></' + ParlayUtility.snakeCase(directive, '-') + '>';
	            }).forEach(function (directive_string) {
	                tabs.appendChild($compile(directive_string)(scope)[0]);
	            });
            }
            
            function defaultDirectives() {
	            var defaults = scope.endpoint.getDefaultDirectives();
	            Object.keys(defaults).forEach(function (target) {
		            defaults[target].forEach(function (directive) {
			            scope.activateDirective(target, directive);
		            });
	            });
            }
            
            function restoreDirectives() {
	            Object.keys(scope.active_directives).forEach(function (target) {
		         	if (target === "tabs") compileTabs(scope.active_directives[target]);
		         	else if (target === "toolbar") compileToolbar(scope.active_directives[target]);
	         	});
            }
            
            var one_time = scope.$watch("active_directives", function (newValue, oldValue, scope) {
	            if (newValue !== undefined && Object.keys(newValue).length > 0) {
		            restoreDirectives();
	            }
	            else {
		            defaultDirectives();
	            }
	            one_time();
            });
	        
        }
    };
}]);