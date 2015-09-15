var parlay_store = angular.module('parlay.store', []);

parlay_store.factory('ParlayStore', ['ParlayStoreService', function (ParlayStoreService) {
	
	var active_instances = {};
	
	function getInstance(prefix) {
		if (!active_instances.hasOwnProperty(prefix)) active_instances[prefix] = new ParlayStoreService(prefix);
		return active_instances[prefix];
	}
	
	return function (prefix) {
		return getInstance(prefix);
	};
	
}]);

parlay_store.factory('ParlayStoreService', function () {
	
	function ParlayStore(prefix) {
		this.prefix = prefix;
	}
	
	ParlayStore.prototype.has = function (directive, attribute) {
		return this.getDirectiveContainer(directive) !== undefined && this.get(directive, attribute) !== undefined;
	};
	
	ParlayStore.prototype.get = function (directive, attribute) {
		return this.getDirectiveContainer(directive)[attribute];
	};
	
	ParlayStore.prototype.set = function (directive, attribute, value) {
		var directiveContainer = this.getDirectiveContainer(directive);
		directiveContainer[attribute] = value;
		this.setDirectiveContainer(directive, directiveContainer);
	};
	
	ParlayStore.prototype.remove = function (directive) {
		sessionStorage.removeItem(this.prefix + '-' + directive);
	};
	
	ParlayStore.prototype.duplicate = function (old_directive, new_directive) {		
		var container = this.getDirectiveContainer(old_directive);
		
		// We should remove and Angular $ or $$ variables since they are generated.
		for (var key in container) {
			if (key.indexOf('$') !== -1) delete container[key];
		}
		
		this.setDirectiveContainer(new_directive, container);
	};
	
	ParlayStore.prototype.clear = function () {
		sessionStorage.clear();
	};
	
	ParlayStore.prototype.keys = function () {
		var values = [];
		for (var i = 0; i < this.length(); i++) {
			var key = sessionStorage.key(i);
			if (key.startsWith(this.prefix)) values.push(key);
		}
		return values;
	};
	
	ParlayStore.prototype.length = function () {
		return sessionStorage.length;
	};
	
	ParlayStore.prototype.values = function () {
		return this.keys().reduce(function (accumulator, key) {
			accumulator[key] = JSON.parse(sessionStorage.getItem(key));
			return accumulator;
		}, {});
	};
	
	ParlayStore.prototype.getDirectiveContainer = function (directive) {
		var sessionStorageString = sessionStorage.getItem(this.prefix + '-' + directive);
		return sessionStorageString !== null ? JSON.parse(sessionStorageString) : {};
	};
	
	ParlayStore.prototype.setDirectiveContainer = function (directive, container) {
		sessionStorage.setItem(this.prefix + '-' + directive, JSON.stringify(container));
	};
	
	ParlayStore.prototype.packedValues = function () {
		var values = [];
		for (var i = 0; i < localStorage.length; i++) {
			var key = localStorage.key(i);
			if (key.startsWith('packed-')) values.push(JSON.parse(localStorage.getItem(key)));
		}
		return values;
	};
	
	ParlayStore.prototype.packItem = function (name, autosave) {
		if (!autosave) autosave = false;
		localStorage.setItem('packed-' + this.prefix + '[' + name + ']', JSON.stringify({
			name: name,
			timestamp: Date.now(),
			data: this.values(),
			autosave: autosave
		}));
	};
	
	ParlayStore.prototype.unpackItem = function (name) {
		var unpacked = JSON.parse(localStorage.getItem('packed-' + this.prefix + '[' + name + ']'));
		Object.keys(unpacked.data).forEach(function (key) {
			sessionStorage.setItem(key, JSON.stringify(unpacked.data[key]));
		});
	};
	
	ParlayStore.prototype.removePackedItem = function (name) {
		localStorage.removeItem('packed-' + this.prefix + '[' + name + ']');
	};
	
	return ParlayStore;
	
});