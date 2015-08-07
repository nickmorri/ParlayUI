var parlay_endpoint = angular.module('parlay.endpoints.endpoint', ['ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main', 'parlay.store']);

parlay_endpoint.factory('ParlayEndpoint', function () {
    
    function NotImplementedError(method) {
        console.warn(method + ' is not implemented for ' + this.name);
    }
    
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
    
    ParlayEndpoint.prototype.setUiState = function (key, value) {
	    this.uiStateStore[key] = value;
    };
    
    ParlayEndpoint.prototype.getType = function () {
        return this.type;
    };
    
    ParlayEndpoint.prototype.getDirectives = function () {
        return [this.directives];
    };
    
    ParlayEndpoint.prototype.matchesQuery = function (query) {
        NotImplementedError('matchesQuery');
    };
    
    ParlayEndpoint.prototype.storeState = function () {
	    ParlayLocalStore.set(this.name, this);
    };
    
    return ParlayEndpoint;
    
});

parlay_endpoint.directive('parlayEndpointCard', ['$compile', 'ParlayLocalStore', function ($compile, ParlayLocalStore) {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-card.html',
        controller: ['$scope', 'ParlayLocalStore', function ($scope, ParlayLocalStore) {
	        
	        function setAttr(directive) {
		        return function () {
			    	ParlayLocalStore.set(directive.replace(' ', '_'), this.exp, this.last);    
		        };		        
	        }
	        
	        function removeItem(directive) {
				return function () {
					ParlayLocalStore.remove(directive.replace(' ', '_'));
				};
			}
	        
	        var key = 'parlayEndpointCard.' + $scope.container.ref.name + '_' + $scope.container.uid;
	        
	        $scope.$watch('active_tab_index', setAttr(key));
	        $scope.$watch('$index', setAttr(key));
	        $scope.$on('$destroy', removeItem(key));
        }],
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
            
            try {
	        	var saved_state = ParlayLocalStore.getDirectiveContainer('parlayEndpointCard.' + scope.endpoint.name.replace(' ', '_') + '_' + scope.container.uid);
	            if (saved_state) scope.active_tab_index = container.active_tab_index;
            } catch(error) {
	            // Maybe we should do something about a cache miss but for now during DEVELOPMENT do nothing.
            }
            
        }
    };
}]);

/* istanbul ignore next */
parlay_endpoint.directive('parlayEndpointsToolbar', function () {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoints-toolbar.html'
    };
});