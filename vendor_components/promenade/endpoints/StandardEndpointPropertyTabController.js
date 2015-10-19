function PromenadeStandardEndpointCardPropertyTabController($scope) {
	ParlayBaseTabController.call(this, $scope);
	
	this.waiting = false;
	
	this.getProperty = function (property) {
		this.waiting = true;
		this.endpoint.getProperty(property).then(function (response) {
			this.waiting = false;		
		}.bind(this));
	};
	
	this.setProperty = function (property) {
		this.waiting = true;
		this.endpoint.setProperty(property).then(function (response) {
			this.waiting = false;
		}.bind(this));
	};
	
	$scope.$on("$destroy", function () {
		$scope.$parent.deactivateDirective("tabs", "promenadeStandardEndpointCardProperty");
	});
}

PromenadeStandardEndpointCardPropertyTabController.prototype = Object.create(ParlayBaseTabController.prototype);

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