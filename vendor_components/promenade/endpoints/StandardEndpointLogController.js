/**
 * Controller constructor for PromenadeStandardEndpointCardLogTabController.
 */
function PromenadeStandardEndpointCardLogTabController($scope, ParlayPersistence, ParlayUtility) {
	ParlayBaseTabController.call(this, $scope);
	
	$scope.filter_text = null;
	
	var container = ParlayUtility.relevantScope($scope, 'container').container;
	var directive_name = 'parlayEndpointCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;
	ParlayPersistence.monitor(directive_name, "filter_text", $scope);
}

// Prototypically inherit from ParlayBaseTabController.
PromenadeStandardEndpointCardLogTabController.prototype = Object.create(ParlayBaseTabController.prototype);

/**
 * Applies a filter to the endpoint log and returns the messages that pass.
 * @param {String} query - text to filter the log by.
 * @returns {Array} - If query is undefined return the full endpoint log, otherwise return the messages that pass the filter.
 */
PromenadeStandardEndpointCardLogTabController.prototype.getFilteredLog = function(query) {
	// If the filter_text isn't null or undefined return the messages that match the query.
    return query ? this.getLog().filter(function (message) {
	    // Look through message topics and contents for a match on the query.
	    return Object.keys(message.TOPICS).some(function (key) {
		    return message.TOPICS[key] !== null && angular.lowercase(message.TOPICS[key].toString()).indexOf(this) > -1;
	    }, this) || Object.keys(message.CONTENTS).some(function (key) {
		    return message.CONTENTS[key] !== null && angular.lowercase(message.CONTENTS[key].toString()).indexOf(this) > -1;
	    }, this);
    }, angular.lowercase(query)) : this.getLog();
};

/**
 * Returns the log stored on the endpoint Object.
 * @returns {Array} - All messages captured by the endpoint.
 */
PromenadeStandardEndpointCardLogTabController.prototype.getLog = function () {
	return this.endpoint.log;
};

/**
 * Directive constructor for PromenadeStandardEndpointCardLog.
 * @returns {Object} - Directive configuration.
 */
function PromenadeStandardEndpointCardLog() {
	return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-log.html',
        controller: 'PromenadeStandardEndpointCardLogTabController',
        controllerAs: "ctrl",
        bindToController: true
    };
}

angular.module('promenade.endpoints.standardendpoint.log', ['parlay.utility', 'parlay.store.persistence', 'luegg.directives'])
	.controller('PromenadeStandardEndpointCardLogTabController', ['$scope', 'ParlayPersistence', 'ParlayUtility', PromenadeStandardEndpointCardLogTabController])
	.directive('promenadeStandardEndpointCardLog', PromenadeStandardEndpointCardLog);