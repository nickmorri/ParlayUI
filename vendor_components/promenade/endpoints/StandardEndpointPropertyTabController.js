/**
 * Controller constructor for the property tab.
 * @constructor
 * @param {AngularJS $scope} $scope - A AngularJS $scope Object.
 */
function PromenadeStandardEndpointCardPropertyTabController($scope) {
	ParlayBaseTabController.call(this, $scope, "promenadeStandardEndpointCardProperty");
	
	// Controller state attribute, true if a request has been sent but the response has not been received. 
	this.waiting = false;
}

// Prototypically inherit from ParlayBaseTabController.
PromenadeStandardEndpointCardPropertyTabController.prototype = Object.create(ParlayBaseTabController.prototype);

/**
 * Gets all property values from an endpoint.
 */
PromenadeStandardEndpointCardPropertyTabController.prototype.getAllProperties = function () {
	Object.keys(this.endpoint.properties).map(function(key) {
		return this.endpoint.properties[key];
	}, this).forEach(this.getProperty.bind(this));
};

/**
 * Sets all property values from an endpoint.
 */
PromenadeStandardEndpointCardPropertyTabController.prototype.setAllProperties = function () {
	Object.keys(this.endpoint.properties).map(function(key) {
		return this.endpoint.properties[key];
	}, this).forEach(this.setProperty.bind(this));
};

/**
 * Gets the given property from the endpoint.
 * @param {Object} property - Property object we want to get from an endpoint.
 */
PromenadeStandardEndpointCardPropertyTabController.prototype.getProperty = function (property) {
	this.waiting = true;
	this.endpoint.getProperty(property).then(function () { this.waiting = false; }.bind(this));
};

/**
 * Sets the given property on the endpoint.
 * @param {Object} property - Property object we want to set on an endpoint.
 */
PromenadeStandardEndpointCardPropertyTabController.prototype.setProperty = function (property) {
	this.waiting = true;
	this.endpoint.setProperty(property).then(function () { this.waiting = false; }.bind(this));
};

/**
 * Directive constructor for PromenadeStandardEndpointCardProperty.
 * @returns {Object} - Directive configuration.
 */
function PromenadeStandardEndpointCardProperty() {
	return {
        scope: {
            endpoint: "="
        },
        templateUrl: "../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-property.html",
        controller: "PromenadeStandardEndpointCardPropertyTabController",
        controllerAs: "ctrl",
        bindToController: true
    };
}

angular.module("promenade.endpoints.standardendpoint.property", [])
	.controller("PromenadeStandardEndpointCardPropertyTabController", ["$scope", PromenadeStandardEndpointCardPropertyTabController])
	.directive("promenadeStandardEndpointCardProperty", PromenadeStandardEndpointCardProperty);