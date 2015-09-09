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
		Private.monitorCommon(directive, attribute, scope, false);
	};
	
	Public.monitorCollection = function (directive, attribute, scope) {
		Private.monitorCommon(directive, attribute, scope, true);
	};
	
	Private.monitorCommon = function (directive, attribute, scope, collection) {
		var restored = false;
		
		function onChange() {
			if (!restored) {
				var previous_value = Private.getAttr(directive, attribute);
				if (previous_value) find_parent(attribute, find_scope(attribute, scope))[attribute] = previous_value;
				restored = true;
			}
			
			if (Private.watchers.hasOwnProperty(attribute)) Private.watchers[attribute]();
			
			Private.watchers[attribute] = collection ? scope.$watchCollection(attribute, Private.setAttr(directive, attribute)) : scope.$watch(attribute, Private.setAttr(directive, attribute));
				
			scope.$on("$destroy", function () {
				Private.removeDirective(directive)();
				Private.watchers[attribute]();
			});
		}
		
		if (collection) scope.$watchCollection(attribute, onChange);
		else scope.$watch(attribute, onChange);
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