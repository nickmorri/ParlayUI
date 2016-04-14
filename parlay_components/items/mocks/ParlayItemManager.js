(function () {
	"use strict";

	angular.module('mock.parlay.items.manager', []).factory('ParlayItemManager', [function () {
		return {
			getActiveItems: function () {
				return [];
			},
			activateItem: function(item) {},
			hasActiveItems: function () {
				return false;
			},
			getAvailableItems: function() {
				return [
					{
						matchesQuery: function () {
							return true;
						}
					},
					{
						matchesQuery: function () {
							return true;
						}
					},
					{
						matchesQuery: function () {
							return false;
						}
					}
				];
			},
			reorder: function(index, distance) {
				//
			},
			duplicateItem: function (index) {
				//
			},
			deactivateItem: function (index) {
				//
			}
		};
	}]);

}());