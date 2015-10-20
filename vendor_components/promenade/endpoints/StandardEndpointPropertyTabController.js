function PromenadeStandardEndpointCardPropertyTabController($scope) {
	ParlayBaseTabController.call(this, $scope);
	
	this.waiting = false;
	
	$scope.$on("$destroy", function () {
		$scope.$parent.deactivateDirective("tabs", "promenadeStandardEndpointCardProperty");
	});
}

PromenadeStandardEndpointCardPropertyTabController.prototype = Object.create(ParlayBaseTabController.prototype);

PromenadeStandardEndpointCardPropertyTabController.prototype.getAllProperties = function () {
	Object.keys(this.endpoint.properties).map(function(key) {
		return this.endpoint.properties[key];
	}, this).forEach(this.getProperty.bind(this));
};

PromenadeStandardEndpointCardPropertyTabController.prototype.setAllProperties = function () {
	Object.keys(this.endpoint.properties).map(function(key) {
		return this.endpoint.properties[key];
	}, this).forEach(this.setProperty.bind(this));
};

PromenadeStandardEndpointCardPropertyTabController.prototype.getProperty = function (property) {
	this.waiting = true;
	this.endpoint.getProperty(property).then(function (response) {
		this.waiting = false;		
	}.bind(this));
};

PromenadeStandardEndpointCardPropertyTabController.prototype.setProperty = function (property) {
	this.waiting = true;
	this.endpoint.setProperty(property).then(function (response) {
		this.waiting = false;
	}.bind(this));
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