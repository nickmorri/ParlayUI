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
	
	Public.monitorAttributes = function(directive, attributes, scope) {
		
		// Wait for the attributes to appear on scope then restore them and being persisting.
		attributes.forEach(function (attribute) {
			
			var been_restored = false;
			
			function onChange() {
				if (!been_restored) {
					Public.restore(directive, Public.gatherProperties(attribute, scope), scope);
					been_restored = true;
				}
				Public.persist(directive, Public.gatherProperties(attribute, scope), scope);
			}
			
			if (typeof scope[attribute] === "number" || typeof scope[attribute] === "string") scope.$watch(attribute, onChange);
			else scope.$watchCollection(attribute, onChange);
		});
	};
	
	Public.gatherProperties = function(attribute, scope) {
		
		var obj = find_scope(attribute, scope)[attribute];
		
		if (obj === undefined) return [];
		if (typeof obj === "number") return [attribute];
		else if (typeof obj === "string") return [attribute];
		else if (Array.isArray(obj)) return [attribute];
		else return Object.keys(obj).map(function (field) {
		    var key = attribute + "." + field;
		    if (obj[field] !== undefined && obj[field].value !== undefined) return key + ".value";
		    else return key;
	    });
    };
	
	Public.restore = function (directive, keys, scope) {
		keys.forEach(function (key) {
			var previous_value = Private.getAttr(directive, key);
			if (previous_value) find_parent(key, find_scope(key, scope))[key] = previous_value;
		});
	};
	
	Public.persist = function (directive, keys, scope) {
		keys.forEach(function (key) {
			if (Private.watchers.hasOwnProperty(key)) Private.watchers[key]();
			Private.watchers[key] = scope.$watch(key, Private.setAttr(directive));
		});
		scope.$on("$destroy", function () {
			Private.removeItem(directive)();
			keys.forEach(function (key) {
				Private.watchers[key]();
			});
		});
	};
	
	Private.getAttr = function(directive, attribute) {
		return ParlayStore('endpoints').get(directive.replace(' ', '_'), attribute);
    };
	
	Private.setAttr = function(directive) {
        return function () {
	    	ParlayStore('endpoints').set(directive.replace(' ', '_'), this.exp, this.last);    
        };		        
    };
    
    Private.removeItem = function(directive) {
		return function () {
			ParlayStore('endpoints').remove(directive.replace(' ', '_'));
		};
	};
	
	return Public;
}]);