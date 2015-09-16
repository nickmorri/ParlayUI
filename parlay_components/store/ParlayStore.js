var parlay_store = angular.module('parlay.store', []);

parlay_store.run(function () {
	// Clear sessionStorage every time we start as some browsers persist sessionStorage across page reloads.
	sessionStorage.clear();
});

parlay_store.factory('ParlayStore', ['ParlayStoreService', function (ParlayStoreService) {
	
	var active_instances = {};
	
	function getInstance(namespace) {
		if (!active_instances.hasOwnProperty(namespace)) active_instances[namespace] = new ParlayStoreService(namespace);
		return active_instances[namespace];
	}
	
	return function (namespace) {
		return getInstance(namespace);
	};
	
}]);

parlay_store.factory('ParlayStoreService', function () {
	
	function ParlayStore(namespace) {
		this.namespace = namespace;
	}
	
	ParlayStore.prototype.hasSessionItem = function (key) {
		return this.getSessionItem(key) !== undefined;
	};
	
	ParlayStore.prototype.getSessionItem = function (key) {
		var json_string = sessionStorage.getItem(this.namespace + '-' + key);
		return json_string !== null ? JSON.parse(json_string) : undefined;
	};
	
	ParlayStore.prototype.setSessionItem = function (key, value) {
		sessionStorage.setItem(this.namespace + '-' + key, JSON.stringify(value));
	};
	
	ParlayStore.prototype.removeSessionItem = function (key) {
		sessionStorage.removeItem(this.namespace + '-' + key);
	};
	
	ParlayStore.prototype.hasLocalItem = function (key) {
		return this.getLocalItem(key) !== undefined;
	};
	
	ParlayStore.prototype.getLocalItem = function (key) {
		var json_string = localStorage.getItem(this.namespace + '-' + key);
		return json_string !== null ? JSON.parse(json_string) : undefined;
	};
	
	ParlayStore.prototype.setLocalItem = function (key, value) {
		localStorage.setItem(this.namespace + '-' + key, JSON.stringify(value));
	};
	
	ParlayStore.prototype.removeLocalItem = function (key) {
		localStorage.removeItem("packed-"  + this.namespace + '[' + key + ']');
	};
	
	ParlayStore.prototype.getSessionLength = function () {
		return sessionStorage.length;
	};
	
	ParlayStore.prototype.getLocalLength = function () {
		return localStorage.length;
	};
	
	ParlayStore.prototype.clearSession = function () {
		sessionStorage.clear();
	};
	
	ParlayStore.prototype.clearLocal = function () {
		localStorage.clear();
	};
	
	ParlayStore.prototype.getSessionKeys = function () {
		var values = [];
		for (var i = 0; i < this.getSessionLength(); i++) {
			var key = sessionStorage.key(i);
			if (key.startsWith(this.namespace)) values.push(key);
		}
		return values;
	};
	
	ParlayStore.prototype.getLocalKeys = function () {
		var values = [];
		for (var i = 0; i < this.getLocalLength(); i++) {
			var key = localStorage.key(i);
			if (key.startsWith("packed-")) values.push(key);
		}
		return values;
	};
	
	ParlayStore.prototype.getSessionValues = function () {
		return this.getSessionKeys().reduce(function (accumulator, key) {
			accumulator[key] = JSON.parse(sessionStorage.getItem(key));
			return accumulator;
		}, {});
	};
	
	ParlayStore.prototype.getLocalValues = function () {
		return this.getLocalKeys().reduce(function (accumulator, key) {
			accumulator[key] = JSON.parse(localStorage.getItem(key));
			return accumulator;
		}, {});
	};
	
	ParlayStore.prototype.moveItemToLocal = function (name, autosave) {
		if (!autosave) autosave = false;
		localStorage.setItem('packed-' + this.namespace + '[' + name + ']', JSON.stringify({
			name: name,
			timestamp: Date.now(),
			data: this.getSessionValues(),
			autosave: autosave
		}));
	};
	
	ParlayStore.prototype.moveItemToSession = function (name) {
		var unpacked = JSON.parse(localStorage.getItem('packed-' + this.namespace + '[' + name + ']'));
		Object.keys(unpacked.data).forEach(function (key) {
			sessionStorage.setItem(key, JSON.stringify(unpacked.data[key]));
		});
	};
	
	return ParlayStore;
	
});