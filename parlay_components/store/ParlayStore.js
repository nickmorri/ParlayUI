/**
 * ParlayStore is a wrapper to the HTML Web Storage APIs.
 * Each ParlayStore instance is created with a namespace which allows management of a ParlayStore 
 * for different modules without worry of items bumping into each other.
 */

function ParlayStore(ParlayStoreService) {
	
	var active_instances = {};
	
	/**
	 * If we have previously constructed a ParlayStore instance for the given namespace return that.
	 * Otherwise create a new ParlayStore for this namespace and cache it.
	 */
	function getInstance(namespace) {
		if (!active_instances.hasOwnProperty(namespace)) active_instances[namespace] = new ParlayStoreService(namespace);
		return active_instances[namespace];
	}
	
	return function (namespace) {
		return getInstance(namespace);
	};
	
}

function ParlayStoreService() {
	
	/**
	 * Constructor for ParlayStore Objects.
	 * @param {String} namespace - ParlayStore operations will be performed on this namespace.
	 */
	function ParlayStore(namespace) {
		this.namespace = namespace;

        /**
         * Returns the count of the items in the ParlayStore's namespace in localStorage.
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
	 * @param {String} key - Key of the item we are looking for in localStorage.
	 * @returns {Boolean} - True if available, false otherwise.
	 */
	ParlayStore.prototype.has = function (key) {
		return this.get(key) !== undefined;
	};
	
	/**
	 * Retrieves the requested key from localStorage.
	 * @param {String} key - Key of the item we are looking for in localStorage.
	 * @returns {Object|undefined} - Return the requested Object if available, undefined otherwise.
	 */
	ParlayStore.prototype.get = function (key) {
		var json_string = localStorage.getItem(this.namespace + '[' + key + ']');
		return json_string !== null ? JSON.parse(json_string) : undefined;
	};
	
	/**
	 * Retrieves the requested key from localStorage.
	 * @param {String} key - Key of the item we are looking for in localStorage.
	 * @returns {Object|undefined} - Return the requested Object if available, undefined otherwise.
	 */
	ParlayStore.prototype.set = function (key, value) {
		localStorage.setItem(this.namespace + '[' + key + ']', JSON.stringify(value));
	};
	
	/**
	 * Remove the key from localStorage.
	 * @param {String} key - Key of the item we are removing from localStorage.
	 */
	ParlayStore.prototype.remove = function (key) {
		localStorage.removeItem(this.namespace + '[' + key + ']');
	};
	
	/**
	 * Removes all items in the namespace from localStorage.
	 */
	ParlayStore.prototype.clear = function () {
		this.keys().forEach(function (key) {
			localStorage.removeItem(key);
		});
	};
	
	/**
	 * Returns an Array of all the keys available in the localStorage namespace.
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
     * @param {String} data - JSON stringified Object of items in the namespace
     */
	ParlayStore.prototype.import = function (data) {
		var items = JSON.parse(data);
        Object.keys(items).forEach(function (name) {
            localStorage.setItem(name, JSON.stringify(items[name]));
        });
	};

    /**
     * @returns {Object} - All items in the current namespace.
     */
	ParlayStore.prototype.export = function () {
		return this.values();
	};

	return ParlayStore;
	
}

angular.module('parlay.store', [])
	.factory('ParlayStore', ['ParlayStoreService', ParlayStore])
	.factory('ParlayStoreService', ParlayStoreService);