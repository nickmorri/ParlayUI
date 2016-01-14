/**
 * Controller constructor for the graph tab.
 * @constructor
 * @param {AngularJS $scope} $scope - A AngularJS $scope Object.
 * @param {Material Angular Service} $mdDialog - Dialog modal service.
 */
function PromenadeStandardEndpointCardGraphTabController($scope, $mdDialog) {
	ParlayBaseTabController.call(this, $scope, "promenadeStandardEndpointCardGraph");

    this.streamColors = [];

    function getStreamColors() {
        this.streamColors = this.getSmoothie().seriesSet.map(function (series) {
            return {
                name: series.options.streamName,
                color: series.options.strokeStyle
            };
        });
    }

	/**
	 * Launches graph configuration $mdDialog modal.
	 * @param {MouseEvent} $event - Used to create source for $mdDialog opening animation.
	 */
	this.openConfigurationDialog = function($event) {
		$mdDialog.show({
			controller: "PromenadeStandardEndpointCardGraphTabConfigurationController",
			controllerAs: "ctrl",
			locals: {
				endpoint: this.endpoint,
				data: this.data,
				smoothie: this.getSmoothie()
			},
			bindToController: true,
			templateUrl: "../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-graph-configuration-dialog.html",
			targetEvent: $event,
			clickOutsideToClose: true
		}).finally(getStreamColors.bind(this));
	};
		
}

// Prototypically inherit from ParlayBaseTabController.
PromenadeStandardEndpointCardGraphTabController.prototype = Object.create(ParlayBaseTabController.prototype);

/**
 * Returns a count of all currently enabled streams.
 * @returns {Number} - Count of currently enabled streams.
 */
PromenadeStandardEndpointCardGraphTabController.prototype.streamCount = function() {
	return Object.keys(this.endpoint.data_streams).filter(function (key) {
    	return this.endpoint.data_streams[key].enabled;
	}.bind(this)).length;
};

/**
 * Controller constructor for the graph configuration dialog.
 * @constructor
 * @param {Material Angular Service} $mdDialog - Dialog modal service.
 */
function PromenadeStandardEndpointCardGraphTabConfigurationController($mdDialog) {
	this.hide = $mdDialog.cancel;
	
	// When minValue or maxValue are defined we should initialize their lock to true.
	this.minimum_locked = this.smoothie.options.minValue !== undefined;
	this.maximum_locked = this.smoothie.options.maxValue !== undefined;
	
	/**
	 * Launch a $mdDialog modal to configure the given stream Object.
	 * @param {MouseEvent} $event - Used to create source for $mdDialog opening animation.
	 * @param {Object} stream - Object that holds stream data and configuration.
	 */
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

/**
 * Toggles the state of the minimum lock. If we are removing lock we should remove the minValue from Smoothie options.
 */
PromenadeStandardEndpointCardGraphTabConfigurationController.prototype.lockMinimum = function () {
	if (this.minimum_locked) this.smoothie.options.minValue = this.smoothie.valueRange.min;
	else delete this.smoothie.options.minValue;
};

/**
 * Toggles the state of the maximum lock. If we are removing lock we should remove the maxValue from Smoothie options.
 */
PromenadeStandardEndpointCardGraphTabConfigurationController.prototype.lockMaximum = function () {
	if (this.maximum_locked) this.smoothie.options.maxValue = this.smoothie.valueRange.max;
	else delete this.smoothie.options.maxValue;
};

/**
 * Toggles the streams between enabled and disabled. Requests or cancels stream depending on state.
 */
PromenadeStandardEndpointCardGraphTabConfigurationController.prototype.toggleStream = function(stream) {
	if (stream.enabled) this.endpoint.requestStream(stream);
	else this.endpoint.cancelStream(stream);
};

/**
 * Controller constructor for the stream configuration dialog.
 * @constructor
 * @param {Material Angular Service} $mdDialog - Dialog modal service.
 */
function PromenadeStandardEndpointCardGraphTabStreamConfigurationController($mdDialog) {
	this.hide = $mdDialog.cancel;
	
	this.updateRate = function() {
		this.endpoint.requestStream(this.stream);
	};
	
}

/**
 * Constructor for the graph directive.
 * @returns {Object} - AngularJS directive object.
 */
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
	.controller("PromenadeStandardEndpointCardGraphTabController", ["$scope", "$mdDialog", PromenadeStandardEndpointCardGraphTabController])
	.controller("PromenadeStandardEndpointCardGraphTabConfigurationController", ["$mdDialog", "endpoint", "data", "smoothie", PromenadeStandardEndpointCardGraphTabConfigurationController])
	.controller("PromenadeStandardEndpointCardGraphTabStreamConfigurationController", ["$mdDialog", "stream", PromenadeStandardEndpointCardGraphTabStreamConfigurationController])
	.directive('promenadeStandardEndpointCardGraph', PromenadeStandardEndpointCardGraph);