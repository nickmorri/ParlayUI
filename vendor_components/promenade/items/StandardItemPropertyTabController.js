/**
 * Controller constructor for the property tab.
 * @constructor
 * @param {AngularJS $scope} $scope - A AngularJS $scope Object.
 */
function PromenadeStandardItemCardPropertyTabController($scope) {
	ParlayBaseTabController.call(this, $scope, "promenadeStandardItemCardProperty");
	
	// Controller state attribute, true if a request has been sent but the response has not been received. 
	this.waiting = false;
}

// Prototypically inherit from ParlayBaseTabController.
PromenadeStandardItemCardPropertyTabController.prototype = Object.create(ParlayBaseTabController.prototype);

PromenadeStandardItemCardPropertyTabController.prototype.hasProperties = function () {
	"use strict";
	return Object.keys(this.item.properties).length > 0;
};

/**
 * Gets all property values from an item.
 */
PromenadeStandardItemCardPropertyTabController.prototype.getAllProperties = function () {
	Object.keys(this.item.properties).map(function(key) {
		return this.item.properties[key];
	}, this).forEach(this.getProperty.bind(this));
};

/**
 * Sets all property values from an item.
 */
PromenadeStandardItemCardPropertyTabController.prototype.setAllProperties = function () {
	Object.keys(this.item.properties).map(function(key) {
		return this.item.properties[key];
	}, this).forEach(this.setProperty.bind(this));
};

/**
 * Gets the given property from the item.
 * @param {Object} property - Property object we want to get from an item.
 */
PromenadeStandardItemCardPropertyTabController.prototype.getProperty = function (property) {
	this.waiting = true;
	this.item.getProperty(property).then(function () { this.waiting = false; }.bind(this));
};

/**
 * Sets the given property on the item.
 * @param {Object} property - Property object we want to set on an item.
 */
PromenadeStandardItemCardPropertyTabController.prototype.setProperty = function (property) {
	this.waiting = true;
	this.item.setProperty(property).then(function () { this.waiting = false; }.bind(this));
};

/**
 * Directive constructor for PromenadeStandardItemCardProperty.
 * @returns {Object} - Directive configuration.
 */
function PromenadeStandardItemCardProperty() {
	return {
        scope: {
            item: "="
        },
        templateUrl: "../vendor_components/promenade/items/directives/promenade-standard-item-card-property.html",
        controller: "PromenadeStandardItemCardPropertyTabController",
        controllerAs: "ctrl",
        bindToController: true
    };
}

angular.module("promenade.items.standarditem.property", [])
	.controller("PromenadeStandardItemCardPropertyTabController", ["$scope", PromenadeStandardItemCardPropertyTabController])
	.directive("promenadeStandardItemCardProperty", PromenadeStandardItemCardProperty);