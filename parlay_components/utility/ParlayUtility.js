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

		// Grabbed from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
		function hexToRgb(hex) {
			// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
			var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				return r + r + g + g + b + b;
			});

			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		}

		function RandColorItem(name, hex) {

            this.name = function () {
                return name;  
            };
            
            this.hex = function () {
                return hex;
            };
            
            this.rgb = function () {
                return hexToRgb(hex);
            };
            
		}

		function RandColor() {
            
			var colors = [
                new RandColorItem("aqua", "#00ffff"),
				new RandColorItem("azure", "#f0ffff"),
				new RandColorItem("beige", "#f5f5dc"),
				new RandColorItem("blue", "#0000ff"),
				new RandColorItem("brown", "#a52a2a"),
				new RandColorItem("cyan", "#00ffff"),
				new RandColorItem("darkblue", "#00008b"),
				new RandColorItem("darkcyan", "#008b8b"),
				new RandColorItem("darkgrey", "#a9a9a9"),
				new RandColorItem("darkgreen", "#006400"),
				new RandColorItem("darkkhaki", "#bdb76b"),
				new RandColorItem("darkmagenta", "#8b008b"),
				new RandColorItem("darkolivegreen", "#556b2f"),
				new RandColorItem("darkorange", "#ff8c00"),
				new RandColorItem("darkorchid", "#9932cc"),
				new RandColorItem("darkred", "#8b0000"),
				new RandColorItem("darksalmon", "#e9967a"),
				new RandColorItem("darkviolet", "#9400d3"),
				new RandColorItem("fuchsia", "#ff00ff"),
				new RandColorItem("gold", "#ffd700"),
				new RandColorItem("green", "#008000"),
				new RandColorItem("indigo", "#4b0082"),
				new RandColorItem("khaki", "#f0e68c"),
				new RandColorItem("lightblue", "#add8e6"),
				new RandColorItem("lightcyan", "#e0ffff"),
				new RandColorItem("lightgreen", "#90ee90"),
				new RandColorItem("lightgrey", "#d3d3d3"),
				new RandColorItem("lightpink", "#ffb6c1"),
				new RandColorItem("lightyellow", "#ffffe0"),
				new RandColorItem("lime", "#00ff00"),
				new RandColorItem("magenta", "#ff00ff"),
				new RandColorItem("maroon", "#800000"),
				new RandColorItem("navy", "#000080"),
				new RandColorItem("olive", "#808000"),
				new RandColorItem("orange", "#ffa500"),
				new RandColorItem("pink", "#ffc0cb"),
				new RandColorItem("purple", "#800080"),
				new RandColorItem("violet", "#800080"),
				new RandColorItem("red", "#ff0000"),
				new RandColorItem("silver", "#c0c0c0"),
				new RandColorItem("yellow", "#ffff00")
			];

			var used = [];

            this.push = function (color) {
                used.splice(used.indexOf(color), 1);                
            };

            this.pop = function () {

                function getRandomIntInclusive(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }
                
                var available = colors.filter(function (color) {
                    return used.indexOf(color) === -1;
                });
                
                var selected_color = available[getRandomIntInclusive(0, available.length)];
                
                used.push(selected_color);
                
                return selected_color;
            };

            this.reset = function () {
                used = [];
            };

		}

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
		 * @param {Object} scope - AngularJS $scope object to begin searching for the attribute on.
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
	 * @returns {Object}
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