(function () {
	"use strict";

    /**
     * @module ParlayStore
     *
     * @description
	 * ParlayStore is a wrapper to the HTML Web Storage APIs.
	 * Each ParlayStore instance is created with a namespace which allows management of a ParlayStore
	 * for different modules without worry of items bumping into each other.
     *
	 */

	var module_dependencies = [];

	angular.module('parlay.store', module_dependencies)
		.factory('ParlayStore', ParlayStore)
		.factory('ParlayStoreService', ParlayStoreService);


	ParlayStore.$inject = ["ParlayStoreService"];
    /**
     * Holds references to the various ParlayStore namespaces.
     * @constructor module:ParlayStore.ParlayStoreService
     * @param ParlayStoreService
     * @returns {Function} - ParlayStore namespace getter.
     */
	function ParlayStore (ParlayStoreService) {

		/**
		 * Holds references to all created ParlayStore instances.
		 * @member module:ParlayStore.ParlayStoreService#active_instances
		 * @private
		 * @type {Object}
         */
		var active_instances = {};

		/**
		 * If we have previously constructed a ParlayStore instance for the given namespace return that.
		 * Otherwise create a new ParlayStore for this namespace and cache it.
		 * @member module:ParlayStore.ParlayStoreService#getInstance
		 * @private
		 */
		function getInstance (namespace) {
			if (!active_instances.hasOwnProperty(namespace)) active_instances[namespace] = new ParlayStoreService(namespace);
			return active_instances[namespace];
		}

		/**
		 * ParlayStore namespace getter.
		 * @param {String} namespace - Unique name that will reference the ParlayStore instance.
		 * @returns {ParlayStore} - Unique ParlayStore namespace instance.
		 */
		return function (namespace) {
			return getInstance(namespace);
		};

	}

	function ParlayStoreService () {

		/**
		 * Interface betwen the Storage API and Parlay. Allows for namespacing of localStorage.
         * @constructor module:ParlayStore.ParlayStore
		 * @param {String} namespace - ParlayStore operations will be performed on this namespace.
		 */
		function ParlayStore (namespace) {

            /**
             * Name of space to separate this ParlayStore's items into.
             * @member module:ParlayStore.ParlayStore#namespace
             * @public
             * @type {String}
             */
			this.namespace = namespace;

			/**
			 * Count of the items in the ParlayStore's namespace in localStorage.
             * @member module:ParlayStore.ParlayStore#length
             * @public
			 * @returns {Number} - Number of items.
			 */
			Object.defineProperty(this, "length", {
				get: function () {
					return this.keys().length;
				}
			});

		}

		/**
		 * Checks if the given key is present in available in localStorage.
         * @member module:ParlayStore.ParlayStore#has
         * @public
		 * @param {String} key - Key of the item we are looking for in localStorage.
		 * @returns {Boolean} - True if available, false otherwise.
		 */
		ParlayStore.prototype.has = function (key) {
			return this.get(key) !== undefined;
		};

		/**
		 * Retrieves the requested key from localStorage.
         * @member module:ParlayStore.ParlayStore#get
         * @public
		 * @param {String} key - Key of the item we are looking for in localStorage.
		 * @returns {Object} - Return the requested Object if available, undefined otherwise.
		 */
		ParlayStore.prototype.get = function (key) {
			var json_string = localStorage.getItem(this.namespace + '[' + key + ']');
			return json_string !== null ? JSON.parse(json_string) : undefined;
		};

		/**
		 * Retrieves the requested key from localStorage.
         * @member module:ParlayStore.ParlayStore#set
         * @public
		 * @param {String} key - Key of the item we are storing in localStorage.
		 * @param {Object} value - Object that we storing in localStorage.
		 * @returns {Object} - Return the requested Object if available, undefined otherwise.
		 */
		ParlayStore.prototype.set = function (key, value) {
			localStorage.setItem(this.namespace + '[' + key + ']', JSON.stringify(value));
		};

		/**
		 * Remove the key from localStorage.
         * @member module:ParlayStore.ParlayStore#remove
         * @public
		 * @param {String} key - Key of the item we are removing from localStorage.
		 */
		ParlayStore.prototype.remove = function (key) {
			localStorage.removeItem(this.namespace + '[' + key + ']');
		};

		/**
		 * Removes all items in the namespace from localStorage.
         * @member module:ParlayStore.ParlayStore#clear
         * @public
		 */
		ParlayStore.prototype.clear = function () {
			this.keys().forEach(function (key) {
				localStorage.removeItem(key);
			});
		};

		/**
		 * Returns an Array of all the keys available in the localStorage namespace.
         * @member module:ParlayStore.ParlayStore#keys
         * @public
		 * @returns {Array} - item keys from localStorage in namespace.
		 */
		ParlayStore.prototype.keys = function () {
			var values = [];
			for (var i = 0; i < localStorage.length; i++) {
				var key = localStorage.key(i);
				if (key.indexOf(this.namespace) === 0) {
					values.push(key);
				}
			}
			return values;
		};

		/**
		 * Returns an Object map of all the items available in the localStorage namespace.
         * @member module:ParlayStore.ParlayStore#values
         * @public
		 * @returns {Object} - items from localStorage in namespace.
		 */
		ParlayStore.prototype.values = function () {
			return this.keys().reduce(function (accumulator, key) {
				accumulator[key] = JSON.parse(localStorage.getItem(key));
				return accumulator;
			}, {});
		};

		/**
		 * Loads a String of all items in the namespace into localStorage.
         * @member module:ParlayStore.ParlayStore#import
         * @public
		 * @param {String} data - JSON stringified Object of items in the namespace
		 */
		ParlayStore.prototype.import = function (data) {
			var items = JSON.parse(data);
			Object.keys(items).forEach(function (name) {
				localStorage.setItem(name, JSON.stringify(items[name]));
			});
		};

		/**
         * Returns all items stored in this namespace.
         * @member module:ParlayStore.ParlayStore#export
         * @public
		 * @returns {Object} - All items in the current namespace.
		 */
		ParlayStore.prototype.export = function () {
			return this.values();
		};

		return ParlayStore;
	}

}());