(function () {
	"use strict";

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
	/* istanbul ignore next */
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
	 * Downloads this Object in JSON encoded format.
	 * @returns {Boolean} - Status of download operation.
	 */
	/* istanbul ignore next */
	Object.defineProperty(Object.prototype, "download", {
		writable: false,
		enumerable: false,
		value: function(filename) {
			var pom = document.createElement('a');
			pom.setAttribute('href', 'data:text/python;base64,' + window.btoa(JSON.stringify(this)));
			pom.setAttribute('download', filename);
			pom.setAttribute('target', '_newtab');
			return pom.dispatchEvent(new MouseEvent("click"));
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

	/**
	 * Attribute directive that binds the given function to the change event.
	 * @returns {AngularJS Directive}
	 */
	function customOnChange () {
		return {
			restrict: 'A',
			link: function (scope, element, attributes) {
				element[0].onchange = scope.$eval(attributes.customOnChange);
			}
		};
	}

	angular.module('parlay.utility', [])
		.directive("customOnChange", customOnChange)
		.factory('ParlayUtility', ParlayUtilityFactory);

}());