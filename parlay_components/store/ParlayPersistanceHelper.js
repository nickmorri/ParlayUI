var parlay_persistence_helper = angular.module('parlay.store.persistence_helper', ['parlay.store']);

parlay_persistence_helper.factory('ParlayPersistence', ['ParlayStore', function (ParlayStore) {
	
	function find_parent(key, scope) {
		var split_key = key.split('.');
		if (split_key.length === 1 && scope.hasOwnProperty(split_key[0])) return scope;
		else if (split_key.length > 1 && scope.hasOwnProperty(split_key[0])) return find_parent(split_key.slice(1).join('.'), scope[split_key[0]]);
		else return undefined;
	}
	
	function find_scope(key, scope) {
		var scope_attribute = key.split('.')[0];
		if (scope === undefined) return undefined;
		else if (scope.hasOwnProperty(scope_attribute)) return scope;
		else if (scope.hasOwnProperty("$parent")) return find_scope(key, scope.$parent);
		else return undefined;
	}
	
	var Public = {};
	
	var Private = {
		watchers: {}
	};
	
	Public.monitor = function (directive, attribute, scope) {
		
		function onChange() {
			// Once we have been notified that the attribute has appeared we should remove this watcher.
			initial_watcher();
			
			// Attempt to restore a previously saved value.
			var previous_value = Private.getAttr(directive, attribute);
			if (previous_value) {
				find_parent(attribute, find_scope(attribute, scope))[attribute] = previous_value;
			}
			
			// Register our permenant watcher on the attribute.
			// NOTE: We are using Angular's deep equality $watch here, this may have a performance hit.
			Private.watchers[attribute] = scope.$watch(attribute, Private.setAttr(directive, attribute), true);

			// When the scope is destroyed we should ensure that we remove our directive from sessionStorage.
			scope.$on("$destroy", function () {
				Private.removeDirective(directive)();
			});
		}
		
		// We setup an initial watcher to wait until the attribute appears on the scope.
		var initial_watcher = scope.$watch(attribute, onChange);
	};
	
	Private.getAttr = function(directive, attribute) {
		return ParlayStore('endpoints').get(directive.replace(' ', '_'), attribute);
    };
	
	Private.setAttr = function(directive, attribute) {
        return function (value) {
	    	ParlayStore('endpoints').set(directive.replace(' ', '_'), attribute, value);
        };		        
    };
    
    Private.removeDirective = function(directive) {
		return function () {
			ParlayStore('endpoints').remove(directive.replace(' ', '_'));
		};
	};
	
	return Public;
}]);