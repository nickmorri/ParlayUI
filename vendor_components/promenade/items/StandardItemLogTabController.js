/**
 * Controller constructor for PromenadeStandardItemCardLogTabController.
 */
function PromenadeStandardItemCardLogTabController($scope, ParlayPersistence, ParlayUtility, $timeout) {
	ParlayBaseTabController.call(this, $scope, "promenadeStandardItemCardLog");
	
	// Initially we don't want to filter logged messages by anything.
	this.filter_text = null;

	this.dynamicItems = {
		getLength: function () {
			return this.getFilteredLog(this.filter_text).length;
		}.bind(this),
		getItemAtIndex: function (index) {
			return this.getFilteredLog(this.filter_text).reverse()[index];
		}.bind(this)
	};

	var container = ParlayUtility.relevantScope($scope, 'container').container;
	var directive_name = 'parlayItemCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;
	ParlayPersistence(directive_name, "filter_text", $scope);
}

// Prototypically inherit from ParlayBaseTabController.
PromenadeStandardItemCardLogTabController.prototype = Object.create(ParlayBaseTabController.prototype);

/**
 * Applies a filter to the item log and returns the messages that pass.
 * @param {String} query - text to filter the log by.
 * @returns {Array} - If query is undefined return the full item log, otherwise return the messages that pass the filter.
 */
PromenadeStandardItemCardLogTabController.prototype.getFilteredLog = function(query) {
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
 * Returns the log stored on the item Object.
 * @returns {Array} - All messages captured by the item.
 */
PromenadeStandardItemCardLogTabController.prototype.getLog = function () {
	return this.item.log;
};

/**
 * Directive constructor for PromenadeStandardItemCardLog.
 * @returns {Object} - Directive configuration.
 */
function PromenadeStandardItemCardLog() {
	return {
        scope: {
            item: "="
        },
        templateUrl: '../vendor_components/promenade/items/directives/promenade-standard-item-card-log.html',
        controller: 'PromenadeStandardItemCardLogTabController',
        controllerAs: "ctrl",
        bindToController: true
    };
}

angular.module('promenade.items.standarditem.log', ['parlay.utility', 'parlay.store.persistence', 'luegg.directives'])
	.controller('PromenadeStandardItemCardLogTabController', ['$scope', 'ParlayPersistence', 'ParlayUtility', '$timeout', PromenadeStandardItemCardLogTabController])
	.directive('promenadeStandardItemCardLog', PromenadeStandardItemCardLog);