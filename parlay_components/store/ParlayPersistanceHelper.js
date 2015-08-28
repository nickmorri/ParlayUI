var parlay_persistence_helper = angular.module('parlay.store.persistence_helper', []);

parlay_persistence_helper.directive('parlayPersistenceHelper', ['ParlayStore', function(ParlayStore) {
	return {
		link: function (scope, element, attributes) {
			
			function getAttr(directive, attribute) {
				return ParlayStore('endpoints').get(directive.replace(' ', '_'), attribute);
            }
			
			function setAttr(directive) {
		        return function () {
			    	ParlayStore('endpoints').set(directive.replace(' ', '_'), this.exp, this.last);    
		        };		        
	        }
	        
	        function removeItem(directive) {
				return function () {
					ParlayStore('endpoints').remove(directive.replace(' ', '_'));
				};
			}
			
			var watchAttributes = attributes.parlayPersistenceHelper.split(',');
			
			var prefix = watchAttributes.find(function (attribute) {
				return attribute.indexOf('[') > -1 && attribute.indexOf(']') > -1;
			});
			
			var key = prefix.replace('[', '').replace(']', '') + '.' + scope.container.ref.name.replace(' ', '_') + '_' + scope.container.uid;
			
			watchAttributes.splice(watchAttributes.indexOf(prefix), 1);
			
			watchAttributes.forEach(function (attribute) {
				scope[attribute] = getAttr(key, attribute);
				scope.$watch(attribute, setAttr(key));
			});
			
			scope.$on('$destroy', removeItem(key));
		}
	};
}]);