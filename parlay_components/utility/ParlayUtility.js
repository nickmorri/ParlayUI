/**
 * Convenience class with useful methods that can be injected throughout Parlay.
 * @constructor
 */
function ParlayUtility() {}

/**
 * Converts directive names to snake-case which Angular requires during directive compilation.
 * @param {String} name - Any cased String.
 * @returns {String} - snake-cased String.
 */
ParlayUtility.prototype.snakeCase = function(name) {
    return name.replace(/[A-Z]/g, function(letter, position) {
        return (position ? '-' : '') + letter.toLowerCase();
    });
};

/**
 * Traverses given scope object until scope is found where attribute exists.
 * @param {AngularJS $scope} scope - AngularJS $scope object to begin searching for the attribute on.
 * @param {String} attribute - Name of the attribute we are searching for.
 */
ParlayUtility.prototype.relevantScope = function(scope, attribute) {
	// Return scope if it has the attribute we are looking for.
	if (scope.hasOwnProperty(attribute))
		return scope;
	// If the scope has a parent scope that isn't null continue searching up the scope tree.
	else if (scope.hasOwnProperty('$parent') && scope.$parent !== null)
		return this.relevantScope(scope.$parent, attribute);
	// Otherwise the attribute doesn't exist on the scope tree and we should return undefined.
	else
		return undefined;
};

/**
 * Copies given text to clipboard and returns outcome.
 * @param {String} text - Content to copy to clipboard.
 * @returns {Boolean} - Status of copy operation.
 */
ParlayUtility.prototype.copyToClipboard = function(text) {
	// Create temporary element that will hold text we want to put in the user's clipboard.
	var element = document.createElement("textarea");
	element.value = text;
	document.body.appendChild(element);
	
	// Select the element, adding a selection to the text.
	element.select();
	
	// Copy the current selection
	var successful = document.execCommand('copy');
			
	// Remove the selection and delete the temporary element.
	window.getSelection().removeAllRanges();
	document.body.removeChild(element);
	
	return successful;
};

function ParlayUtilityFactory() {
	return new ParlayUtility();
}

angular.module('parlay.utility', [])
	.factory('ParlayUtility', ParlayUtilityFactory);