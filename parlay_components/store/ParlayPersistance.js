function ParlayPersistenceFactory(ParlayStore) {
	
	var store = ParlayStore("items");
	
	/**
	 * Returns the attribute from the ParlayStore.
	 * @param {String} directive - Name of the directive we are interested in.
	 * @param {String} attribute - Name of the attribute we are interested in.
	 * @returns {Object} - Requested attribute from ParlayStore.
	 */
	function getAttr(directive, attribute) {
		var container = store.getSessionItem(directive.replace(' ', '_'));
		return container !== undefined && container.hasOwnProperty(attribute) ? container[attribute] : undefined;
    }
	
	/**
	 * Given a key that belongs to the given scope search for the parent that belongs to the key.
	 * Example: 'message.data.speed' returns the data Object on message.
	 * @param {Object} parent - Object or Angular scope to search for the parent of the key on.
	 * @param {String} key - Name of a potentially nested attribute whose parent we are looking for.
	 */
	function find_parent(key, parent) {
		var split_key = key.split('.');
		if (split_key.length === 1 && parent.hasOwnProperty(split_key[0])) return parent;
		else if (split_key.length > 1 && parent.hasOwnProperty(split_key[0])) return find_parent(split_key.slice(1).join('.'), parent[split_key[0]]);
		else return undefined;
	}
	
	/**
	 * Given a key and a base scope we will search up the scope tree looking for the scope that has our scope object.
	 * @param {String} key - attribute we are searching for on the scope/
	 * @param {Object} scope - Angular scope to search for the key on.
	 */
	function find_scope(key, scope) {
		var scope_attribute = key.split('.')[0];
		if (scope === undefined) return undefined;
		else if (scope.hasOwnProperty(scope_attribute)) return scope;
		else if (scope.hasOwnProperty("$parent")) return find_scope(key, scope.$parent);
		else return undefined;
	}
	
	/**
     * Handles restoring the directive's attribute on the given scope from ParlayStore.
     * @param {String} directive - Name of the directive we are interested in.
	 * @param {String} attribute - Name of the attribute we are interested in.
	 * @param {Object} scope - Angular $scope object relevant to the attributes to restore.
     */
	function restoreAttr(directive, attribute, scope) {
		var split_key = attribute.split('.');
		var previous_value = getAttr(directive, attribute);
		if (previous_value) {
			find_parent(attribute, find_scope(attribute, scope))[split_key[split_key.length - 1]] = previous_value;
		}
	}
	
	/**
	 * Returns a function that records the attribute in the ParlayStore.
	 * @param {String} directive - Name of the directive we are interested in.
	 * @param {String} attribute - Name of the attribute we are interested in.
	 * @returns {Function} - A function with with directive and attribute variables in it's closure.
	 */
	function setAttr(directive, attribute) {
        return function setAttr(value) {
	        var container = store.getSessionItem(directive.replace(' ', '_'));
	        if (container === undefined) container = {};	
	        container[attribute] = value;	        
			store.setSessionItem(directive.replace(' ', '_'), container);            
        };
    }
	
	/**
	 * Returns a function that will remove the directive from ParlayStore.
	 * @param {String} directive - Name of the directive we are interested in.
	 * @returns {Function} - A function with directive in it's closure. 
	 */
    function removeDirective(directive) {
		return function removeDirective() {
			store.removeSessionItem(directive.replace(' ', '_'));
		};
	}
	
	/**
	 * Restores then monitors the requested attribute to the from and to the given directive on the scope passed in.
	 * @example
	 * // ParlayPersistence('parlayItemCard.motor5', 'voltage', $scope); 
	 * Returns the attribute from the ParlayStore.
	 * @param {String} directive - Name of the directive we are interested in.
	 * @param {String} attribute - Name of the attribute we are interested in.
	 * @param {Object} scope - Angular $scope object relevant to the attributes to persist.
	 * @returns {Object} - Requested attribute from ParlayStore.
	 */
	return function monitor(directive, attribute, scope) {
			
		function onChange() {
			// Once we have been notified that the attribute has appeared we should remove this watcher.
			initial_watcher();
			
			// Attempt to restore a previously saved value.
			restoreAttr(directive, attribute, scope);
			
			// Register our permenant watcher on the attribute.
			// NOTE: We are using Angular's deep equality $watch here, this may have a performance hit. May want to do some profiling here.
			scope.$watch(attribute, setAttr(directive, attribute), true);

			// When the scope is destroyed we should ensure that we remove our directive from sessionStorage.
			scope.$on("$destroy", removeDirective(directive));
		}
		
		// We setup an initial watcher to wait until the attribute appears on the scope.
		var initial_watcher = scope.$watch(attribute, onChange);
	};
	
}

angular.module('parlay.store.persistence', ['parlay.store'])
	.factory('ParlayPersistence', ['ParlayStore', ParlayPersistenceFactory]);