var parlay_store = angular.module('parlay.store', []);

parlay_store.factory('ParlayLocalStore', ['ParlayLocalStoreService', '$window', function (ParlayLocalStoreService, $window) {
	
	var active_instances = {};
	
	function getInstance(prefix) {
		if (active_instances.hasOwnProperty(prefix)) return active_instances[prefix];
		else return new ParlayLocalStoreService(prefix);
	}
	
	$window.onbeforeunload = function () {
		var store = getInstance('endpoints');
		if (store.length()) store.packItem('auto', true);
	};
	
	return function (prefix) {
		return getInstance(prefix);
	};
	
}]);

parlay_store.factory('ParlayLocalStoreService', function () {
	
	function ParlayLocalStore(prefix) {
		this.prefix = prefix;
	}
	
	ParlayLocalStore.prototype.has = function (directive, attribute) {
		return this.get(directive) !== undefined && this.get(directive)[attribute] !== undefined;
	};
	
	ParlayLocalStore.prototype.get = function (directive, attribute) {
		return this.getDirectiveContainer(directive)[attribute];
	};
	
	ParlayLocalStore.prototype.set = function (directive, attribute, value) {
		var directiveContainer = this.getDirectiveContainer(directive);
		directiveContainer[attribute] = value;
		this.setDirectiveContainer(directive, directiveContainer);
	};
	
	ParlayLocalStore.prototype.remove = function (directive) {
		sessionStorage.removeItem(this.prefix + '-' + directive);
	};
	
	ParlayLocalStore.prototype.clear = function () {
		sessionStorage.clear();
	};
	
	ParlayLocalStore.prototype.keys = function () {
		var values = [];
		for (var i = 0; i < this.length(); i++) {
			var key = sessionStorage.key(i);
			if (key.startsWith(this.prefix)) values.push(key);
		}
		return values;
	};
	
	ParlayLocalStore.prototype.length = function () {
		return sessionStorage.length;
	};
	
	ParlayLocalStore.prototype.values = function () {
		return this.keys().reduce(function (accumulator, key) {
			accumulator[key] = JSON.parse(sessionStorage.getItem(key));
			return accumulator;
		}, {});
	};
	
	ParlayLocalStore.prototype.getDirectiveContainer = function (directive) {
		var sessionStorageString = sessionStorage.getItem(this.prefix + '-' + directive);
		return sessionStorageString !== null ? JSON.parse(sessionStorageString) : {};
	};
	
	ParlayLocalStore.prototype.setDirectiveContainer = function (directive, container) {
		sessionStorage.setItem(this.prefix + '-' + directive, JSON.stringify(container));
	};
	
	ParlayLocalStore.prototype.packedValues = function () {
		var values = [];
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			if (key.startsWith('packed-')) values.push(JSON.parse(localStorage.getItem(key)));
		}
		return values;
	};
	
	ParlayLocalStore.prototype.packItem = function (name, autosave) {
		if (!autosave) autosave = false;
		localStorage.setItem('packed-' + this.prefix + '[' + name + ']', JSON.stringify({
			name: name,
			timestamp: Date.now(),
			data: this.values(),
			autosave: autosave
		}));
	};
	
	ParlayLocalStore.prototype.unpackItem = function (name) {
		var unpacked = JSON.parse(localStorage.getItem('packed-' + this.prefix + '[' + name + ']'));
		Object.keys(unpacked.data).forEach(function (key) {
			sessionStorage.setItem(key, JSON.stringify(unpacked.data[key]));
		});
	};
	
	ParlayLocalStore.prototype.removePackedItem = function (name) {
		localStorage.removeItem('packed-' + this.prefix + '[' + name + ']');
	};
	
	return ParlayLocalStore;
	
});