var parlay_store = angular.module('parlay.store', []);

parlay_store.factory('ParlayLocalStore', ['$window', function ($window) {
	
	var Private = {};
	
	var Public = {};
	
	Public.has = function (directive, attribute) {
		return Public.get(directive) !== undefined && Public.get(directive)[attribute] !== undefined;
	};
	
	Public.get = function (directive, attribute) {
		return JSON.parse(Public.getDirectiveContainer(directive))[attribute];
	};
	
	Public.set = function (directive, attribute, value) {
		var directiveContainer = Public.getDirectiveContainer(directive);
		directiveContainer[attribute] = value;
		Public.setDirectiveContainer(directive, directiveContainer);
	};
	
	Public.remove = function (directive) {
		localStorage.removeItem(directive);
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
	
	Public.values = function () {
		return Public.keys().reduce(function (accumulator, key) {
			accumulator[key] = JSON.parse(localStorage.getItem(key));
			return accumulator;
		}, {});
	};
	
	Public.getDirectiveContainer = function (directive) {
		var localStorageString = localStorage.getItem(directive);
		return localStorageString !== null ? JSON.parse(localStorageString) : {};
	};
	
	Public.setDirectiveContainer = function (directive, container) {
		localStorage.setItem(directive, JSON.stringify(container));
	};
	
	return Public;	
}]);