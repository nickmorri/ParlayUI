var parlay_persistence = angular.module('parlay.store.persistence', ['parlay.store']);

parlay_persistence.factory('ParlayPersistence', ['ParlayStore', function (ParlayStore) {
	
	var Public = {};
	
	var Private = {};
	
	/**
	 * Restores then monitors the requested attribute to the from and to the given directive on the scope passed in.
	 * @example
	 * // ParlayPersistence.monitor('parlayEndpointCard.motor5', 'voltage', $scope); 
	 * @param {String} directive - Name of the directive we are interested in.
	 * @param {String} attribute - Name of the attribute we are interested in.
	 * @param {Object} scope - Angular $scope object relevant to the attributes to persist.
	 */
	Public.monitor = function (directive, attribute, scope) {
		
		function onChange() {
			// Once we have been notified that the attribute has appeared we should remove this watcher.
			initial_watcher();
			
			// Attempt to restore a previously saved value.
			Private.restoreAttr(directive, attribute, scope);
			
			// Register our permenant watcher on the attribute.
			// NOTE: We are using Angular's deep equality $watch here, this may have a performance hit. May want to do some profiling here.
			scope.$watch(attribute, Private.setAttr(directive, attribute), true);

			// When the scope is destroyed we should ensure that we remove our directive from sessionStorage.
			scope.$on("$destroy", function () {
				Private.removeDirective(directive)();
			});
		}
		
		// We setup an initial watcher to wait until the attribute appears on the scope.
		var initial_watcher = scope.$watch(attribute, onChange);
	};
	
	/**
	 * Given a key that belongs to the given scope search for the parent that belongs to the key.
	 * Example: 'message.data.speed' returns the data Object on message.
	 * @param {Object} parent - Object or Angular scope to search for the parent of the key on.
	 * @param {String} key - Name of a potentially nested attribute whose parent we are looking for.
	 */
	Private.find_parent = function(key, parent) {
		var split_key = key.split('.');
		if (split_key.length === 1 && parent.hasOwnProperty(split_key[0])) return parent;
		else if (split_key.length > 1 && parent.hasOwnProperty(split_key[0])) return Private.find_parent(split_key.slice(1).join('.'), parent[split_key[0]]);
		else return undefined;
	};
	
	/**
	 * Given a key and a base scope we will search up the scope tree looking for the scope that has our scope object.
	 * @param {String} key - attribute we are searching for on the scope/
	 * @param {Object} scope - Angular scope to search for the key on.
	 */
	Private.find_scope = function(key, scope) {
		var scope_attribute = key.split('.')[0];
		if (scope === undefined) return undefined;
		else if (scope.hasOwnProperty(scope_attribute)) return scope;
		else if (scope.hasOwnProperty("$parent")) return Private.find_scope(key, scope.$parent);
		else return undefined;
	};
	
	Private.restoreAttr = function (directive, attribute, scope) {
		var split_key = attribute.split('.');
		var previous_value = Private.getAttr(directive, attribute);
		if (previous_value) {
			Private.find_parent(attribute, Private.find_scope(attribute, scope))[split_key[split_key.length - 1]] = previous_value;
		}
	};
	
	/**
	 * Returns the attribute from the ParlayStore.
	 * @param {String} directive - Name of the directive we are interested in.
	 * @param {String} attribute - Name of the attribute we are interested in.
	 * @returns {Object} - Requested attribute from ParlayStore.
	 */
	Private.getAttr = function(directive, attribute) {
		return ParlayStore('endpoints').get(directive.replace(' ', '_'), attribute);
    };
	
	
	/**
	 * Returns a function that records the attribute in the ParlayStore.
	 * @param {String} directive - Name of the directive we are interested in.
	 * @param {String} attribute - Name of the attribute we are interested in.
	 * @returns {Function} - A function with with directive and attribute variables in it's closure.
	 */
	Private.setAttr = function(directive, attribute) {
        return function setAttr(value) {
	    	ParlayStore('endpoints').set(directive.replace(' ', '_'), attribute, value);
        };		        
    };
    
    /**
	 * Returns a function that will remove the directive from ParlayStore.
	 * @param {String} directive - Name of the directive we are interested in.
	 * @returns {Function} - A function with directive in it's closure. 
	 */
    Private.removeDirective = function(directive) {
		return function removeDirective() {
			ParlayStore('endpoints').remove(directive.replace(' ', '_'));
		};
	};
	
	return Public;
}]);