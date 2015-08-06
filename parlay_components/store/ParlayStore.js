var parlay_store = angular.module('parlay.store', []);

parlay_store.factory('ParlayLocalStore', function () {
	
	var Private = {};
	
	var Public = {};
	
	Public.get = function (key) {};
	
	Public.set = function (key, value) {
		localStorage.setItem(key, value);
	};
	
	Public.remove = function (key) {
		localStorage.removeItem(key);
	};
	
	Public.clear = function () {
		localStorage.clear();
	};
	
	Public.keys = function () {
		var values = [];
		for (var i = 0; i < Public.length(); i++) values.push(localStorage.key(i));
		return values;
	};
	
	Public.length = function () {
		return localStorage.length;
	};
	
	Public.watch = function (sourceDirective) {
		return function () {
			Public.set(sourceDirective + '.' + this.exp, this.last);
		};
	};
	
	return Public;
});