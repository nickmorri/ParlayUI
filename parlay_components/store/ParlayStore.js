/**
 * ParlayStore is a wrapper to the HTML Web Storage APIs.
 * Each ParlayStore instance is created with a namespace which allows management of a ParlayStore 
 * for different modules without worry of items bumping into each other.
 */

function RunStore() {
	// Clear sessionStorage every time we start as some browsers persist sessionStorage across page reloads.
	sessionStorage.clear();
}

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
	}
	
	/**
	 * Checks if the given key is present in available in sessionStorage.
	 * @param {String} key - Key of the item we are looking for in sessionStorage.
	 * @returns {Boolean} - True if available, false otherwise.
	 */
	ParlayStore.prototype.hasSessionItem = function (key) {
		return this.getSessionItem(key) !== undefined;
	};
	
	/**
	 * Retrieves the requested key from sessionStorage.
	 * @param {String} key - Key of the item we are looking for in sessionStorage.
	 * @returns {Object|undefined} - Return the requested Object if available, undefined otherwise.
	 */
	ParlayStore.prototype.getSessionItem = function (key) {
		var json_string = sessionStorage.getItem(this.namespace + '-' + key);
		return json_string !== null ? JSON.parse(json_string) : undefined;
	};
	
	/**
	 * Sets the value of the key in sessionStorage.
	 * @param {String} key - Key of the item we are setting in sessionStorage.
	 * @param {Object} value - Any valid object that can be JSON stringified.
	 */
	ParlayStore.prototype.setSessionItem = function (key, value) {
		sessionStorage.setItem(this.namespace + '-' + key, JSON.stringify(value));
	};
	
	/**
	 * Remove the key from sessionStorage.
	 * @param {String} key - Key of the item we are removing from sessionStorage.
	 */
	ParlayStore.prototype.removeSessionItem = function (key) {
		sessionStorage.removeItem(this.namespace + '-' + key);
	};
	
	/**
	 * Checks if the given key is present in available in localStorage.
	 * @param {String} key - Key of the item we are looking for in localStorage.
	 * @returns {Boolean} - True if available, false otherwise.
	 */
	ParlayStore.prototype.hasLocalItem = function (key) {
		return this.getLocalItem(key) !== undefined;
	};
	
	/**
	 * Retrieves the requested key from localStorage.
	 * @param {String} key - Key of the item we are looking for in localStorage.
	 * @returns {Object|undefined} - Return the requested Object if available, undefined otherwise.
	 */
	ParlayStore.prototype.getLocalItem = function (key) {
		var json_string = localStorage.getItem(this.namespace + '-' + key);
		return json_string !== null ? JSON.parse(json_string) : undefined;
	};
	
	/**
	 * Retrieves the requested key from localStorage.
	 * @param {String} key - Key of the item we are looking for in localStorage.
	 * @returns {Object|undefined} - Return the requested Object if available, undefined otherwise.
	 */
	ParlayStore.prototype.setLocalItem = function (key, value) {
		localStorage.setItem(this.namespace + '-' + key, JSON.stringify(value));
	};
	
	/**
	 * Remove the key from localStorage.
	 * @param {String} key - Key of the item we are removing from localStorage.
	 */
	ParlayStore.prototype.removeLocalItem = function (key) {
		localStorage.removeItem("packed-"  + this.namespace + '[' + key + ']');
	};
	
	/**
	 * Returns the count of the items in the ParlayStore's namespace in sessionStorage.
	 * @returns {Number} - Number of items.
	 */
	ParlayStore.prototype.getSessionLength = function () {
		return this.getSessionKeys().length;
	};
	
	/**
	 * Returns the count of the items in the ParlayStore's namespace in localStorage.
	 * @returns {Number} - Number of items.
	 */
	ParlayStore.prototype.getLocalLength = function () {
		return this.getLocalKeys().length;
	};
	
	/**
	 * Removes all items in the namespace from sessionStorage.
	 */
	ParlayStore.prototype.clearSession = function () {
		this.getSessionKeys().forEach(function (key) {
			sessionStorage.removeItem(key);
		});
	};
	
	/**
	 * Removes all items in the namespace from localStorage.
	 */
	ParlayStore.prototype.clearLocal = function () {
		this.getLocalKeys().forEach(function (key) {
			localStorage.removeItem(key);
		});
	};
	
	/**
	 * Returns an Array of all the keys available in the sessionStorage namespace.
	 * @returns {Array} - item keys from sessionStorage in namespace.
	 */
	ParlayStore.prototype.getSessionKeys = function () {
		var values = [];
		for (var i = 0; i < sessionStorage.length; i++) {
			var key = sessionStorage.key(i);
			if (key.startsWith(this.namespace)) values.push(key);
		}
		return values;
	};
	
	/**
	 * Returns an Array of all the keys available in the localStorage namespace.
	 * @returns {Array} - item keys from localStorage in namespace.
	 */
	ParlayStore.prototype.getLocalKeys = function () {
		var values = [];
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			if (key.startsWith("packed-")) values.push(key);
		}
		return values;
	};
	
	/**
	 * Returns an Obejct map of all the items available in the sessionStorage namespace.
	 * @returns {Array} - items from sessionStorage in namespace.
	 */
	ParlayStore.prototype.getSessionValues = function () {
		return this.getSessionKeys().reduce(function (accumulator, key) {
			accumulator[key] = JSON.parse(sessionStorage.getItem(key));
			return accumulator;
		}, {});
	};
	
	/**
	 * Returns an Obejct map of all the items available in the localStorage namespace.
	 * @returns {Array} - items from localStorage in namespace.
	 */
	ParlayStore.prototype.getLocalValues = function () {
		return this.getLocalKeys().reduce(function (accumulator, key) {
			accumulator[key] = JSON.parse(localStorage.getItem(key));
			return accumulator;
		}, {});
	};
	
	/**
	 * Packages all Objects in the namespace on sessionStorage and places it in localStorage for persistence betwene browser sessions.
	 * Use ParlayStore.moveItemToSession to retrieve stored sessionStorage namespaces.
	 * @param {String} name - Unique name we will use to name the container in localStorage.
	 * @param {Boolean} autosave - Flag set to indicate this container was created automatically.
	 */
	ParlayStore.prototype.moveItemToLocal = function (name, autosave) {
		if (!autosave) autosave = false;
		localStorage.setItem('packed-' + this.namespace + '[' + name + ']', JSON.stringify({
			name: name,
			timestamp: Date.now(),
			data: this.getSessionValues(),
			autosave: autosave
		}));
	};
	
	/**
	 * Unpackages all the Objects stored in the container referenced be name in localStorage and places them in the namespace in sessionStorage.
	 * Use ParlayStore.moveItemToLocal to store sessionStorage namespaces in localStorage.
	 * @param {String} name - Unique name of the container we are going to unpack in sessionStorage
	 */
	ParlayStore.prototype.moveItemToSession = function (name) {
		var unpacked = JSON.parse(localStorage.getItem('packed-' + this.namespace + '[' + name + ']'));
		Object.keys(unpacked.data).forEach(function (key) {
			sessionStorage.setItem(key, JSON.stringify(unpacked.data[key]));
		});
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
     * @returns {Array} - All items in the current namespace.
     */
	ParlayStore.prototype.export = function () {
		return this.getLocalValues();
	};

	return ParlayStore;
	
}

angular.module('parlay.store', [])
	.run(RunStore)
	.factory('ParlayStore', ['ParlayStoreService', ParlayStore])
	.factory('ParlayStoreService', ParlayStoreService);