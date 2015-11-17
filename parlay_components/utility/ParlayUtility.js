/**
 * Returns the power set of the key / value pairs.
 * TODO: Write test cases!
 * @returns {Set} power set of strings
 */
Object.defineProperty(Set.prototype, "powerset", {
    writable: false,
    enumerable: false,
    value: function () {
        "use strict";

        var sets = new Set();

        if (this.size < 1) {
            sets.add(new Set());
            return sets;
        }

        var values = this.values();
        var head = values.next().value;
        var rest = new Set(values);

        rest.powerset().forEach(function (set) {
            var newSet = new Set();
            newSet.add(head);
            set.forEach(function (item) { newSet.add(item); });
            sets.add(newSet);
            sets.add(set);
        });

        return sets;
    }
});

/**
 * Returns an array of a all possible combinations of key / value pairs.
 * * TODO: Write test cases!
 * @returns {Array} all possible encoded topic stings
 */
Object.defineProperty(Object.prototype, "combinationsOf", {
    writable: false,
    enumerable: false,
    value: function() {

        var initial_set = new Set(Object.keys(this).map(function (key) { return key; }));

        var combinations = [];

        initial_set.powerset().forEach(function (set) {
            var topics_combination = {};
            set.forEach(function (key) {
                topics_combination[key] = this[key];
            }.bind(this));
            combinations.push(topics_combination.stableEncode());
        }.bind(this));

        return combinations;
    }
});

/**
 * Encodes Object by sorting comparing keys in Unicode code point order.
 * @returns {String} Translation of key, values to String.
 */
Object.defineProperty(Object.prototype, "stableEncode", {
    writable: false,
    enumerable: false,
    value: function() {
        if (this === undefined || this === null) return "null";
        else if (typeof this === 'string' || this instanceof String) return '"' + this + '"';
        else if (typeof this === 'number' || this instanceof Number) return this.toString();
        else if (typeof this === 'boolean' || this instanceof Boolean) return this.toString();
        else if (Array.isArray(this)) return this.sort().reduce(function (previous, current, index) {
                var currentString = previous;

                if (index > 0) currentString += ",";

                return currentString + current.stableEncode();
            }, "[") + "]";
        else if (typeof this === 'object') return Object.keys(this).sort().reduce(function (previous, current, index) {
                var currentString = previous;

                if (index > 0) currentString += ",";

                return currentString + '"' + current + '":' + this[current].stableEncode();
            }.bind(this), "{") + "}";
        else return this.toString();
    }
});

/**
 * Converts this String to snake-case.
 * @param {String} name - Any cased String.
 * @returns {String} - snake-cased String.
 */
Object.defineProperty(String.prototype, "snakeCase", {
	writable: false,
	enumerable: false,
	value: function() {
    	return this.replace(/[A-Z]/g, function(letter, position) {
	        return (position ? '-' : '') + letter.toLowerCase();
	    });
	}
});

/**
 * Copies this String to clipboard and returns outcome.
 * @returns {Boolean} - Status of copy operation.
 */
Object.defineProperty(String.prototype, "copyToClipboard", {
	writable: false,
	enumerable: false,
	value: function() {
		// Create temporary element that will hold text we want to put in the user's clipboard.
		var element = document.createElement("textarea");
		element.value = this;
		document.body.appendChild(element);
		
		// Select the element, adding a selection to the text.
		element.select();
		
		// Copy the current selection
		var successful = document.execCommand('copy');
				
		// Remove the selection and delete the temporary element.
		window.getSelection().removeAllRanges();
		document.body.removeChild(element);
		
		return successful;
	}
});

/**
 * Convenience class with useful methods that can be injected throughout Parlay.
 * @constructor
 */
function ParlayUtility() {}

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

function ParlayUtilityFactory() {
	return new ParlayUtility();
}

angular.module('parlay.utility', [])
	.factory('ParlayUtility', ParlayUtilityFactory);