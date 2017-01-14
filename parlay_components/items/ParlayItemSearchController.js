(function () {
    "use strict";

    var module_dependencies = ['templates-main', 'parlay.items.manager', 'parlay.widget.manager'];

    angular
        .module('parlay.items.search', module_dependencies)
        .controller('ParlayItemSearchController', ParlayItemSearchController);

    ParlayItemSearchController.$inject = ['$scope', '$mdSidenav', '$mdDialog', 'ParlayItemManager', 'ParlayWidgetManager'];
    /**
     * Handles providing [ParlayItem]{@link module:ParlayItem.ParlayItem}s to the mdAutocomplete directive.
     * @constructor module:ParlayItem.ParlayItemSearchController
     * @param {Object} $scope - AngularJS $scope Object.
     * @param {Object} $mdSidenav - Angular Material sidenav service.
     * @param {Object} $mdDialog - Angular Material dialog service.
     * @param {Object} ParlayItemManager - ParlayItemManager service.
     */
    function ParlayItemSearchController ($scope, $mdSidenav, $mdDialog, ParlayItemManager, ParlayWidgetManager) {

        var ctrl = this;

        /**
         * Create filter function for a query string
         * @member module:ParlayItem.ParlayItemSearchController#createFilterFor
         * @private
         * @param {String} query - Name of item to query by.
         */
        function createFilterFor (query) {
            var lowercase_query = angular.lowercase(query);

            return function filterFn(item) {
                return item.matchesQuery(lowercase_query);
            };
        }

        $scope.search_text = null;
        $scope.selected_item = null;

        ctrl.selectItem = selectItem;
        ctrl.querySearch = querySearch;
        ctrl.hasDiscovered = hasDiscovered;
        ctrl.toggle = toggle;
        ctrl.closeSearch = $mdDialog.cancel;

        /**
         * On event handler for user selection of [ParlayItem]{@link module:ParlayItem.ParlayItem}.
         * @member module:ParlayItem.ParlayItemSearchController#selectItem
         * @public
         * @param item
         */
        function selectItem (item) {
            // Change is detected after we set item to null.
            if (item === null || item === undefined) {
                return;
            }

            $scope.search_text = null;
            $scope.selected_item = null;

            // Hide sidenav after selecting item on smaller screen sizes where the sidenav is initially hidden.
            if (!$mdSidenav("navigation").isLockedOpen()) {
                $mdSidenav("navigation").close();
            }
            ParlayWidgetManager.add("StandardItem", item.id);
        }

        /**
         * Search for items.
         * @member module:ParlayItem.ParlayItemSearchController#querySearch
         * @public
         * @param {String} query - Name of item to find.
         */
        function querySearch (query) {
            // function compare(item1, item2) {
            //     return item1.name.toString().toLowerCase() > item2.name.toString().toLowerCase();
            // }

            var items = ParlayItemManager.getAvailableItems();

            return query ? items.filter(createFilterFor(query)) : items;
        }

        /**
         * True if discovered, false otherwise.
         * @member module:ParlayItem.ParlayItemSearchController#querySearch
         * @public
         * @returns {Boolean}
         */
        function hasDiscovered () {
            return ParlayItemManager.hasDiscovered();
        }

        /**
         * Toggles the item to show its children in the item modal
         * TODO:  probally need to move this to the ItemLibrary module
         * @member module:ParlayItem.ParlayItemSearchController#toggle
         * @public
         * @param item
         */
        function toggle(item) {
            console.warn("toggle(): not yet implemented");
        }
    }
}());