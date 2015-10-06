function PromenadeStandardEndpointCardGraphTabController($scope, $mdDialog, $interval) {
	ParlayBaseTabController.call(this, $scope);
	
	this.chart_config = {
        grid: {
	        fillStyle: 'transparent',
	        strokeStyle: 'transparent',
	        borderVisible: false
	    },
	    labels: {
		    fillStyle: '#000000',
		    fontSize: 12
		}
	};
		
	this.openConfigurationDialog = function($event) {
		$mdDialog.show({
			controller: "PromenadeStandardEndpointCardGraphTabConfigurationController",
			controllerAs: "ctrl",
			locals: {
				endpoint: this.endpoint,
				data: this.data,
				smoothie: $scope.getSmoothie()
			},
			bindToController: true,
			templateUrl: "../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-graph-configuration-dialog.html",
			targetEvent: $event,
			clickOutsideToClose: true
		});
	};
	
	$scope.$on("$destroy", function () {
		$scope.$parent.deactivateDirective("tabs", "promenadeStandardEndpointCardGraph");
	});
	
}

PromenadeStandardEndpointCardGraphTabController.prototype = Object.create(ParlayBaseTabController.prototype);

PromenadeStandardEndpointCardGraphTabController.prototype.streamCount = function() {
	return Object.keys(this.endpoint.data_streams).filter(function (key) {
    	return this.endpoint.data_streams[key].enabled;
	}.bind(this)).length;
};

function PromenadeStandardEndpointCardGraphTabConfigurationController($mdDialog, $timeout) {
	this.hide = $mdDialog.cancel;
	
	this.minimum_locked = this.smoothie.options.minValue !== undefined;
	this.maximum_locked = this.smoothie.options.maxValue !== undefined;	
		
	this.configureStream = function($event, stream) {
		$mdDialog.show({
			controller: "PromenadeStandardEndpointCardGraphTabStreamConfigurationController",
			controllerAs: "ctrl",
			locals: {
				endpoint: this.endpoint,
				stream: stream
			},
			bindToController: true,
			templateUrl: "../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-graph-stream-configuration-dialog.html",
			targetEvent: $event,
			clickOutsideToClose: true
		});
	};
	
}

PromenadeStandardEndpointCardGraphTabConfigurationController.prototype.lockMinimum = function () {
	if (this.minimum_locked) this.smoothie.options.minValue = this.smoothie.valueRange.min;
	else delete this.smoothie.options.minValue;
};

PromenadeStandardEndpointCardGraphTabConfigurationController.prototype.lockMaximum = function () {
	if (this.maximum_locked) this.smoothie.options.maxValue = this.smoothie.valueRange.max;
	else delete this.smoothie.options.maxValue;
};

PromenadeStandardEndpointCardGraphTabConfigurationController.prototype.toggleStream = function(stream) {
	if (stream.enabled) this.endpoint.requestStream(stream);
	else this.endpoint.cancelStream(stream);
};

function PromenadeStandardEndpointCardGraphTabStreamConfigurationController($mdDialog, $timeout) {
	this.hide = $mdDialog.cancel;
	
	this.updateRate = function() {
		this.endpoint.requestStream(this.stream);
	};
	
}

function PromenadeStandardEndpointCardGraph() {
	return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-graph.html',
        controller: "PromenadeStandardEndpointCardGraphTabController",
		controllerAs: "ctrl",
		bindToController: true
    };
}

angular.module('promenade.endpoints.standardendpoint.graph', ["promenade.smoothiechart"])
	.controller("PromenadeStandardEndpointCardGraphTabController", ["$scope", "$mdDialog", '$interval', PromenadeStandardEndpointCardGraphTabController])
	.controller("PromenadeStandardEndpointCardGraphTabConfigurationController", ["$mdDialog", "$timeout", "endpoint", "data", "smoothie", PromenadeStandardEndpointCardGraphTabConfigurationController])
	.controller("PromenadeStandardEndpointCardGraphTabStreamConfigurationController", ["$mdDialog", "$timeout", "stream", PromenadeStandardEndpointCardGraphTabStreamConfigurationController])
	.directive('promenadeStandardEndpointCardGraph', PromenadeStandardEndpointCardGraph);