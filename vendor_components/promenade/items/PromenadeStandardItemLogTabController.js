(function () {
    "use strict";

    var module_name = "promenade.items.standarditem.log";
    var module_dependencies = ['parlay.utility', 'parlay.notification', 'parlay.item.persistence', 'luegg.directives'];

    // Register module as [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} dependency.
    standard_item_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .controller('PromenadeStandardItemCardLogTabController', PromenadeStandardItemCardLogTabController)
        .controller('PromenadeStandardItemCardLogItemController', PromenadeStandardItemCardLogItemController)
        .directive('promenadeStandardItemCardLog', PromenadeStandardItemCardLog)
        .directive('promenadeStandardItemCardLogItem', PromenadeStandardItemCardLogItem);


    PromenadeStandardItemCardLogTabController.$inject = ['$scope', 'ParlayItemPersistence', 'ParlayUtility'];
    /**
     * Controller constructor for PromenadeStandardItemCardLogTabController.
     * @constructor module:PromenadeStandardItem.PromenadeStandardItemCardLogTabController
     * @param {Object} $scope - A AngularJS $scope Object.
     * @param {Object} ParlayItemPersistence - Service that provides automatic persistence of scope variables to localStorage.
     * @param {Object} ParlayUtility - Service that provides utility functions.
     */
    function PromenadeStandardItemCardLogTabController ($scope, ParlayItemPersistence, ParlayUtility) {

        var ctrl = this;

        /**
         * Text used to filter the log.
         * Initially we don't want to filter logged messages by anything.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardLogTabController#getFilteredLog
         * @public
         * @default
         * @type {(String|null)}
         */
        ctrl.filter_text = null;

        /**
         * Flag for descending or !descending (ascending) list.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardLogTabController#descending
         * @public
         * @default
         * @type {Boolean}
         */
        ctrl.descending = false;

        // Attach methods to controller.
        ctrl.getFilteredLog = getFilteredLog;
        ctrl.getLog = getLog;

        var container = ParlayUtility.relevantScope($scope, 'container').container;
        var directive_name = 'parlayItemCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;

        // Persist filter text across sessions.
        ParlayItemPersistence.monitor(directive_name, "filter_text", $scope);

        /**
         * Applies a filter to the item log and returns the messages that pass.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardLogTabController#getFilteredLog
         * @param {String} query - Query to filter the log by.
         * @param {Boolean} reverse - Reverse the filter log if true, otherwise return in original order.
         * @returns {Array} - If query is undefined return the full item log, otherwise return the messages that pass the filter.
         */
        function getFilteredLog (query, reverse) {

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
            var log = query ? ctrl.getLog().filter(buildFilterOn(query)) : ctrl.getLog();

            return !!reverse ? log.reverse() : log;
        }

        /**
         * Returns the log stored on the item Object.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardLogTabController#getLog
         * @param {String} query - Query to filter the log by.
         * @returns {Array} - All messages captured by the item.
         */
        function getLog () {
            return ctrl.item.log;
        }

    }


    PromenadeStandardItemCardLogItemController.$inject = ['ParlayNotification'];
    /**
     * Controller for Parlay Card Log Item.
     * @constructor module:PromenadeStandardItem.PromenadeStandardItemCardLogItemController
     * @param {Object} ParlayNotification - ParlayNotification service.
     */
    function PromenadeStandardItemCardLogItemController (ParlayNotification) {

        var ctrl = this;

        // Attach methods to controller.
        ctrl.copy = copy;

        /**
         * Attempts to copy the message to the end-user's clipboard. A ParlayNotification is displayed with the
         * success or failure of the copy operation.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardLogItemController#copy
         * @public
         */
        function copy () {
            ParlayNotification.show({
                content: JSON.stringify(angular.copy(ctrl.message)).copyToClipboard() ?
                    "Message copied to clipboard" : "Copy failed. Check browser compatibility."
            });
        }
    }

    /**
     * Directive constructor for PromenadeStandardItemCardLog.
     * @returns {Object} - Directive configuration.
     */
    /* istanbul ignore next */
    function PromenadeStandardItemCardLog () {
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

    PromenadeStandardItemCardLogItem.$inject = ["ParlayNotification"];
    /**
     * Parlay Card Log Item directive.
     * @returns {Object}
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

}());