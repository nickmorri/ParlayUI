/**
 * Controller constructor for the property tab.
 * @constructor
 * @param {AngularJS Service} $q - AngularJS $q Service.
 */
function PromenadeStandardItemCardPropertyTabController($q) {
	// Controller state attribute, true if a request has been sent but the response has not been received. 
	this.waiting = false;

    this.hasProperties = function () {
        return Object.keys(this.item.properties).length > 0;
    };

    /**
     * Gets all property values from an item.
     */
    this.getAllProperties = function () {
        this.waiting = true;
        return $q.all(Object.keys(this.item.properties).map(function (key) {
            return this.item.properties[key].get();
        }, this)).then(function () {
            this.waiting = false;
        }.bind(this));
    };

    /**
     * Sets all property values from an item.
     */
    this.setAllProperties = function () {
        this.waiting = true;
        return $q.all(Object.keys(this.item.properties).map(function (key) {
            return this.item.properties[key].set();
        }, this)).then(function () {
            this.waiting = false;
        }.bind(this));
    };
}

/**
 * Directive constructor for PromenadeStandardItemCardProperty.
 * @returns {Object} - Directive configuration.
 */
/* istanbul ignore next */
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
	.controller("PromenadeStandardItemCardPropertyTabController", ["$q", PromenadeStandardItemCardPropertyTabController])
	.directive("promenadeStandardItemCardProperty", PromenadeStandardItemCardProperty);