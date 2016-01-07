function ParlayEndpointFactory() {
    
    function ParlayEndpoint(data, protocol) {
        
        Object.defineProperty(this, "name", {
            value: data.NAME,
            enumerable: true,
            writeable: false,
            configurable: false
        });
        
        Object.defineProperty(this, "protocol", {
            value: protocol,
            writeable: false,
            enumerable: false,
            configurable: false
        });
        
        this.type = "ParlayEndpoint";
        
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
            available_cache: {}
        };

        // Add widget selection tab by default for every ParlayEndpoint.
        this.addDefaultDirectives("tabs", ["parlayWidgetTab"]);
        
    }

    /**
     * Gets endpoint type.
     * @returns {String} - Endpoint type
     */
    ParlayEndpoint.prototype.getType = function () {
        return this.type;
    };

    /**
     * Adds the given directives as defaults for the specified target.
     * @param {String} target - Directive target: toolbar or tabs.
     * @param {Array} directives - Array of directive names.
     */
    ParlayEndpoint.prototype.addDefaultDirectives = function(target, directives) {
	    this.directives[target].default = this.directives[target].default.concat(directives);
    };

    /**
     * Adds the given directives as available for the specified target.
     * @param {String} target - Directive target: toolbar or tabs.
     * @param {Array} directives - Array of directive names.
     */
    ParlayEndpoint.prototype.addAvailableDirectives = function (target, directives) {
	    this.directives[target].available = this.directives[target].available.concat(directives);
    };

    /**
     * Gets the directives that have been added as defaults.
     * @returns {Object} - Mapping of target -> Array of default directive names.
     */
    ParlayEndpoint.prototype.getDefaultDirectives = function () {
	    var endpoint = this;
	    return Object.keys(endpoint.directives).reduce(function (accumulator, target) {
		    if (endpoint.directives[target].hasOwnProperty("default")) {
			    accumulator[target] = endpoint.directives[target].default;
		    }
		    return accumulator;
	    }, {});
    };

    /**
     * Gets the directives that have been added as available.
     * @returns {Object} - Mapping of target -> Array of available directive names.
     */
    ParlayEndpoint.prototype.getAvailableDirectives = function () {
        var endpoint = this;
    	endpoint.directives.available_cache = Object.keys(endpoint.directives).filter(function (target) {
			return target.indexOf("cache") === -1;
		}).reduce(function (accumulator, target) {
	        accumulator[target] = endpoint.directives[target].available;
	        return accumulator;
        }, {});
        return this.directives.available_cache;
    };

    /**
     * Abstract method that should be overwritten by those that prototypically inherit from ParlayEndpoint.
     * @param {String} query - Given query that would be matched to the endpoint's properties.
     */
    ParlayEndpoint.prototype.matchesQuery = function (query) {
	    console.warn("matchesQuery is not implemented for " + this.name);
    };
    
    return ParlayEndpoint;
    
}

/**
 * @name ParlayEndpointCard
 * @param $compile - AngularJS service used to create a template function used to link scope and template.
 * @param ParlayPersistence - Parlay service used to persist scope values into local storage.
 * @description
 * Directive that displays data from a particular ParlayEndpoint.
 * @returns AngularJS directive
 */
function ParlayEndpointCard($compile, ParlayPersistence) {
    return {
        templateUrl: "../parlay_components/endpoints/directives/parlay-endpoint-card.html",
        link: function (scope, element, attributes) {

	        // Grab the endpoint reference from the container for convenience of using scope.endpoint.
	        scope.endpoint = scope.container.ref;

            var directive_name = "parlayEndpointCard." + scope.endpoint.name.replace(" ", "_") + "_" + scope.container.uid;

            // Container used to hold the names of the currently active directives.
            // Allows for ParlayPersistence to mirror the active directives to local storage.
	        scope.active_directives = {};

            /**
             * Compiles then stores the given directive in active_directives.
             * @param {String} target - Directive location: toolbar or tabs.
             * @param {String} directive - Name of directive
             */
	        scope.activateDirective = function (target, directive) {
				if (target === "tabs") compileTabs([directive]);
				else if (target === "toolbar") compileToolbar([directive]);

				if (!scope.active_directives.hasOwnProperty(target)) {
					scope.active_directives[target] = [];
				}
				scope.active_directives[target].push(directive);
			};

            /**
             * Removes the directive from the active_directives container.
             * @param {String} target - Directive location: toolbar or tabs.
             * @param {String} directive - Name of directive
             */
			scope.deactivateDirective = function (target, directive) {
                var index = scope.active_directives[target].indexOf(directive);
                // If directive exists in active_directives then remove, otherwise throw error.
                if (index > -1) scope.active_directives[target].splice(index, 1);
                else throw new Error("Attempted to deactivate inactive directive");
			};

            // Using ParlayPersistence we will first attempt to restore these values then we will record them to ParlayStore.
            ParlayPersistence(directive_name, "$index", scope);
            ParlayPersistence(directive_name, "active_tab_index", scope);
            ParlayPersistence(directive_name, "active_directives", scope);

            /**
	         * Compiles the toolbar set on the endpoint.
	         * @param {Array} directives - Array of directive name strings.
	         */
            function compileToolbar(directives) {
	            // Locate toolbar where we are going to insert dynamic directives.
	            var toolbar = element[0].querySelector("div.md-toolbar-tools");

	            directives.map(function (directive) {
                    return "<" + directive.snakeCase() + " endpoint='endpoint' layout-fill layout='row' layout-align='space-between center'></" + directive.snakeCase() + ">";
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
	            var tabs = element[0].querySelector("md-tabs");

	            directives.map(function (directive) {
					return "<" + directive.snakeCase() + " endpoint='endpoint'></" + directive.snakeCase() + ">";
	            }).forEach(function (directive_string) {
	                tabs.appendChild($compile(directive_string)(scope)[0]);
	            });
            }

            /**
             * Activate each default directive.
             */
            function defaultDirectives() {
	            var defaults = scope.endpoint.getDefaultDirectives();
	            Object.keys(defaults).forEach(function (target) {
		            defaults[target].forEach(function (directive) {
			            scope.activateDirective(target, directive);
		            });
	            });
            }

            /**
             * Compile each directive in active_directives.
             */
            function restoreDirectives() {
	            Object.keys(scope.active_directives).forEach(function (target) {
		         	if (target === "tabs") compileTabs(scope.active_directives[target]);
		         	else if (target === "toolbar") compileToolbar(scope.active_directives[target]);
	         	});
            }

            // Wait for ParlayPersistence to restore active_directives on scope.
            var one_time = scope.$watch("active_directives", function (newValue) {
                // Call the deregistration function for this one time listener.
                one_time();
                // If active_directives has been restored by ParlayPersistence then we should restore these directives.
                // Otherwise we should use the defaults.
                if (newValue !== undefined && Object.keys(newValue).length > 0) restoreDirectives();
	            else defaultDirectives();
            });

        }
    };
}

angular.module("parlay.endpoints.endpoint", ["ngMaterial", "ngMessages", "ngMdIcons", "templates-main", "parlay.store.persistence", "parlay.utility", "parlay.endpoints.widgettab"])
	.factory("ParlayEndpoint", ParlayEndpointFactory)
	.directive("parlayEndpointCard", ["$compile", "ParlayPersistence", ParlayEndpointCard]);