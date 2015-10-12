function ParlayUtility() {
	return {
		// Converts directive names to snake-case which Angular requires during directive compilation.
        snakeCase: function(name) {
            return name.replace(/[A-Z]/g, function(letter, pos) {
                return (pos ? '-' : '') + letter.toLowerCase();
            });
        },
        // Traverses up scope tree looking for the target scope attribute
        relevantScope: function(currentScope, attribute) {
		    return currentScope.hasOwnProperty(attribute) ? currentScope : currentScope.hasOwnProperty('$parent') && currentScope.$parent !== null ? this.relevantScope(currentScope.$parent, attribute) : undefined;
		}
	};
}

angular.module('parlay.utility', [])
	.factory('ParlayUtility', ParlayUtility);