(function () {
    "use strict";

    /**
     * Controller constructor for PromenadeStandardItemCardLogTabController.
     */
    function PromenadeStandardItemCardLogTabController($scope, ParlayPersistence, ParlayUtility) {

        // Initially we don't want to filter logged messages by anything.
        this.filter_text = null;

        // Initially we want an ascending list.
        this.descending = false;

        var container = ParlayUtility.relevantScope($scope, 'container').container;
        var directive_name = 'parlayItemCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;
        ParlayPersistence.monitor(directive_name, "filter_text", $scope);
    }

    /**
     * Applies a filter to the item log and returns the messages that pass.
     * @param {String} query - Query to filter the log by.
     * @param {Boolean} reverse - Reverse the filter log if true, otherwise return in original order.
     * @returns {Array} - If query is undefined return the full item log, otherwise return the messages that pass the filter.
     */
    PromenadeStandardItemCardLogTabController.prototype.getFilteredLog = function(query, reverse) {

        function buildFilterOn(query) {
            var lowercase_query = angular.lowercase(query);

            return function (message) {

                var matches_topics = Object.keys(message.TOPICS).some(function (key) {
                    return !!message.TOPICS[key] && angular.lowercase(message.TOPICS[key].toString()).indexOf(lowercase_query) > -1;
                });

                var matches_contents = Object.keys(message.CONTENTS).some(function (key) {
                    return !!message.CONTENTS[key] && angular.lowercase(message.CONTENTS[key].toString()).indexOf(lowercase_query) > -1;
                });

                return matches_topics || matches_contents;

            };
        }

        // If the filter_text isn't null or undefined return the messages that match the query.
        var log = query ? this.getLog().filter(buildFilterOn(query)) : this.getLog();

        return !!reverse ? log.reverse() : log;
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
    /* istanbul ignore next */
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

    /**
     * Controller for Parlay Card Log Item.
     * @param {Parlay Service} ParlayNotification - Displays notifications to user.
     * @constructor
     */
    function PromenadeStandardItemCardLogItemController (ParlayNotification) {
        this.copy = function () {
            ParlayNotification.show({content: JSON.stringify(angular.copy(this.message)).copyToClipboard() ?
                "Message copied to clipboard" : "Copy failed. Check browser compatibility."});
        };
    }
    /**
     * Parlay Card Log Item directive.
     * @returns {AngularJS directive factory}
     * @constructor
     */
    /* istanbul ignore next */
    function PromenadeStandardItemCardLogItem() {
        return {
            scope: { message: "=" },
            controller: 'PromenadeStandardItemCardLogItemController',
            controllerAs: "ctrl",
            bindToController: true,
            templateUrl: '../vendor_components/promenade/items/directives/promenade-standard-item-card-log-item.html'
        };
    }

    angular.module('promenade.items.standarditem.log', ['parlay.utility', 'parlay.notification', 'parlay.store.persistence', 'luegg.directives'])
        .controller('PromenadeStandardItemCardLogTabController', ['$scope', 'ParlayPersistence', 'ParlayUtility', PromenadeStandardItemCardLogTabController])
        .controller('PromenadeStandardItemCardLogItemController', ['ParlayNotification', PromenadeStandardItemCardLogItemController])
        .directive('promenadeStandardItemCardLog', PromenadeStandardItemCardLog)
        .directive('promenadeStandardItemCardLogItem', ["ParlayNotification", PromenadeStandardItemCardLogItem]);

}());