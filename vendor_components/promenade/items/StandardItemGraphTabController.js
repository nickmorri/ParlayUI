/**
 * Controller constructor for the graph tab.
 * @constructor
 * @param {AngularJS $scope} $scope - A AngularJS $scope Object.
 * @param {Material Angular Service} $mdDialog - Dialog modal service.
 */
function PromenadeStandardItemCardGraphTabController($scope, $mdDialog, $interval) {
	ParlayBaseTabController.call(this, $scope, "promenadeStandardItemCardGraph");

    this.streamColors = [];

    function getStreamColors() {
        this.streamColors = this.getSmoothie() ? this.getSmoothie().seriesSet.map(function (series) {
            return {
                name: series.options.streamName,
                color: series.options.strokeStyle
            };
        }) : [];
    }

	/**
	 * Launches graph configuration $mdDialog modal.
	 * @param {MouseEvent} $event - Used to create source for $mdDialog opening animation.
	 */
	this.openConfigurationDialog = function($event) {
		$mdDialog.show({
			controller: "PromenadeStandardItemCardGraphTabConfigurationController",
			controllerAs: "ctrl",
			locals: {
				item: this.item,
				data: this.data,
				smoothie: this.getSmoothie()
			},
			bindToController: true,
			templateUrl: "../vendor_components/promenade/items/directives/promenade-standard-item-card-graph-configuration-dialog.html",
			targetEvent: $event,
			clickOutsideToClose: true
		}).finally(getStreamColors.bind(this));
	};

	$interval(getStreamColors.bind(this), 1000);
		
}

// Prototypically inherit from ParlayBaseTabController.
PromenadeStandardItemCardGraphTabController.prototype = Object.create(ParlayBaseTabController.prototype);

/**
 * Returns a count of all currently enabled streams.
 * @returns {Number} - Count of currently enabled streams.
 */
PromenadeStandardItemCardGraphTabController.prototype.streamCount = function() {
	return Object.keys(this.item.data_streams).filter(function (key) {
    	return this.item.data_streams[key].enabled;
	}.bind(this)).length;
};

/**
 * Controller constructor for the graph configuration dialog.
 * @constructor
 * @param {Material Angular Service} $mdDialog - Dialog modal service.
 */
function PromenadeStandardItemCardGraphTabConfigurationController($mdDialog) {
	this.hide = $mdDialog.hide;
	
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
			controller: "PromenadeStandardItemCardGraphTabStreamConfigurationController",
			controllerAs: "ctrl",
			locals: {
				item: this.item,
				stream: stream
			},
			bindToController: true,
			templateUrl: "../vendor_components/promenade/items/directives/promenade-standard-item-card-graph-stream-configuration-dialog.html",
			targetEvent: $event,
			clickOutsideToClose: true
		});
	};
	
}

/**
 * Toggles the state of the minimum lock. If we are removing lock we should remove the minValue from Smoothie options.
 */
PromenadeStandardItemCardGraphTabConfigurationController.prototype.lockMinimum = function () {
    // Occurs when user enables checkbox.
	if (this.minimum_locked) {
        // We want to remove the y range function when the user explicitly sets value as these should not automatically
        // be scaled. Store a reference to it so it can be restored if the lock is removed.
        this.smoothie.options.yRangeFunctionRef = this.smoothie.options.yRangeFunction;
        delete this.smoothie.options.yRangeFunction;
        this.smoothie.options.minValue = this.smoothie.valueRange.min;
    }
    // Occurs when user disables checkbox.
	else {
        // Set the y range function when the user remove the lock.
        this.smoothie.options.yRangeFunction = this.smoothie.options.yRangeFunctionRef;
        delete this.smoothie.options.yRangeFunctionRef;
        delete this.smoothie.options.minValue;
    }
};

/**
 * Toggles the state of the maximum lock. If we are removing lock we should remove the maxValue from Smoothie options.
 */
PromenadeStandardItemCardGraphTabConfigurationController.prototype.lockMaximum = function () {
    // Occurs when user enables checkbox.
	if (this.maximum_locked) {
        // We want to remove the y range function when the user explicitly sets value as these should not automatically
        // be scaled. Store a reference to it so it can be restored if the lock is removed.
        this.smoothie.options.yRangeFunctionRef = this.smoothie.options.yRangeFunction;
        delete this.smoothie.options.yRangeFunction;
        this.smoothie.options.maxValue = this.smoothie.valueRange.max;
    }
    // Occurs when user disables checkbox.
	else {
        // Set the y range function when the user remove the lock.
        this.smoothie.options.yRangeFunction = this.smoothie.options.yRangeFunctionRef;
        delete this.smoothie.options.yRangeFunctionRef;
        delete this.smoothie.options.maxValue;
    }
};

/**
 * Toggles the streams between enabled and disabled. Requests or cancels stream depending on state.
 */
PromenadeStandardItemCardGraphTabConfigurationController.prototype.toggleStream = function(stream) {
	if (stream.enabled) this.item.requestStream(stream);
	else this.item.cancelStream(stream);
};

/**
 * Controller constructor for the stream configuration dialog.
 * @constructor
 * @param {Material Angular Service} $mdDialog - Dialog modal service.
 */
function PromenadeStandardItemCardGraphTabStreamConfigurationController($mdDialog) {
	this.hide = $mdDialog.cancel;
	
	this.updateRate = function() {
		this.item.requestStream(this.stream);
	};
	
}

/**
 * Constructor for the graph directive.
 * @returns {Object} - AngularJS directive object.
 */
function PromenadeStandardItemCardGraph() {
	return {
        scope: {
            item: "="
        },
        templateUrl: '../vendor_components/promenade/items/directives/promenade-standard-item-card-graph.html',
        controller: "PromenadeStandardItemCardGraphTabController",
		controllerAs: "ctrl",
		bindToController: true
    };
}

angular.module('promenade.items.standarditem.graph', ["promenade.smoothiechart"])
	.controller("PromenadeStandardItemCardGraphTabController", ["$scope", "$mdDialog", "$interval", PromenadeStandardItemCardGraphTabController])
	.controller("PromenadeStandardItemCardGraphTabConfigurationController", ["$mdDialog", "item", "data", "smoothie", PromenadeStandardItemCardGraphTabConfigurationController])
	.controller("PromenadeStandardItemCardGraphTabStreamConfigurationController", ["$mdDialog", "stream", PromenadeStandardItemCardGraphTabStreamConfigurationController])
	.directive('promenadeStandardItemCardGraph', PromenadeStandardItemCardGraph);