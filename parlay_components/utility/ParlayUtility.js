(function () {
	"use strict";

	var module_dependencies = [];

	angular
		.module('parlay.utility', module_dependencies)
		.directive("customOnChange", customOnChange)
		.factory("RandColor", RandColorFactory)
		.factory('ParlayUtility', ParlayUtilityFactory);

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

	function RandColorFactory() {

		function RandColor() {

			this.names = {
				aqua: "#00ffff",
				azure: "#f0ffff",
				beige: "#f5f5dc",
				blue: "#0000ff",
				brown: "#a52a2a",
				cyan: "#00ffff",
				darkblue: "#00008b",
				darkcyan: "#008b8b",
				darkgrey: "#a9a9a9",
				darkgreen: "#006400",
				darkkhaki: "#bdb76b",
				darkmagenta: "#8b008b",
				darkolivegreen: "#556b2f",
				darkorange: "#ff8c00",
				darkorchid: "#9932cc",
				darkred: "#8b0000",
				darksalmon: "#e9967a",
				darkviolet: "#9400d3",
				fuchsia: "#ff00ff",
				gold: "#ffd700",
				green: "#008000",
				indigo: "#4b0082",
				khaki: "#f0e68c",
				lightblue: "#add8e6",
				lightcyan: "#e0ffff",
				lightgreen: "#90ee90",
				lightgrey: "#d3d3d3",
				lightpink: "#ffb6c1",
				lightyellow: "#ffffe0",
				lime: "#00ff00",
				magenta: "#ff00ff",
				maroon: "#800000",
				navy: "#000080",
				olive: "#808000",
				orange: "#ffa500",
				pink: "#ffc0cb",
				purple: "#800080",
				violet: "#800080",
				red: "#ff0000",
				silver: "#c0c0c0",
				yellow: "#ffff00"
			};

			this.used = {};

		}

		RandColor.prototype.push = function (color_code) {
			var target_name;

			for (var color_name in this.used) {
				if (this.used[color_name] == color_code) {
					target_name = color_name;
					break;
				}
			}

			if (!!target_name) {
				delete this.used[target_name];
			}
		};

		RandColor.prototype.pop = function () {

			function getRandomIntInclusive(min, max) {
				return Math.floor(Math.random() * (max - min + 1)) + min;
			}

			var names = Object.keys(this.names).filter(function (name) {
				return !this.used[name];
			}, this);

			var color_name = names[getRandomIntInclusive(0, names.length)];

			this.used[color_name] = this.names[color_name];

			return {name: color_name, code: this.names[color_name]};
		};

		RandColor.prototype.reset = function () {
			this.used = {};
		};

		return RandColor;
	}

	function ParlayUtilityFactory() {

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

}());