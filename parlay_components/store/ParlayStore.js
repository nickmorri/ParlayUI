var parlay_store = angular.module('parlay.store', []);

parlay_store.factory('ParlayLocalStore', function () {
	
	var Private = {};
	
	var Public = {};
	
	Public.has = function (directive, attribute) {
		return Public.get(directive) !== undefined && Public.get(directive)[attribute] !== undefined;
	};
	
	Public.get = function (directive, attribute) {
		return JSON.parse(localStorage.getItem(directive))[attribute];
	};
	
	Public.set = function (directive, attribute, value) {
		var directiveContainer = Private.getDirectiveContainer(directive);
		directiveContainer[attribute] = value;
		Private.setDirectiveContainer(directive, directiveContainer);
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
	
	Private.getDirectiveContainer = function (directive) {
		var localStorageString = localStorage.getItem(directive);
		return localStorageString !== null ? JSON.parse(localStorageString) : {};
	};
	
	Private.setDirectiveContainer = function (directive, container) {
		localStorage.setItem(directive, JSON.stringify(container));
	};
	
	return Public;
});