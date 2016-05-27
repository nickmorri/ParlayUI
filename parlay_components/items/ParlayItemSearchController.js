(function () {
    "use strict";

    var module_dependencies = ['templates-main', 'parlay.items.manager'];

    angular
        .module('parlay.items.search', module_dependencies)
        .controller('ParlayItemSearchController', ParlayItemSearchController)
        .directive('parlayItemSearch', ParlayItemSearch);

    ParlayItemSearchController.$inject = ['$scope', '$mdSidenav', 'ParlayItemManager'];
    /**
     * Handles providing [ParlayItem]{@link module:ParlayItem.ParlayItem}s to the mdAutocomplete directive.
     * @constructor module:ParlayItem.ParlayItemSearchController
     * @param {Object} $scope - AngularJS $scope Object.
     * @param {Object} $mdSidenav - Angular Material sidenav service.
     * @param {Object} ParlayItemManager - ParlayItemManager service.
     */
    function ParlayItemSearchController ($scope, $mdSidenav, ParlayItemManager) {

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

        $scope.selected_item = null;
        $scope.search_text = null;

        ctrl.selectItem = selectItem;
        ctrl.querySearch = querySearch;
        ctrl.hasDiscovered = hasDiscovered;

        /**
         * On event handler for user selection of ParlayItem.
         * @member module:ParlayItem.ParlayItemSearchController#selectItem
         * @public
         * @param item
         */
        function selectItem (item) {
            // Change is detected after we set item to null.
            if (item === null || item === undefined) {
                return;
            }
            ParlayItemManager.activateItem(item);
            $scope.selected_item = null;
            $scope.search_text = null;

            // Hide sidenav after selecting item on smaller screen sizes where the sidenav is initially hidden.
            if (!$mdSidenav("navigation").isLockedOpen()) {
                $mdSidenav("navigation").close();
            }
        }

        /**
         * Search for items.
         * @member module:ParlayItem.ParlayItemSearchController#querySearch
         * @public
         * @param {String} query - Name of item to find.
         */
        function querySearch (query) {
            return query ? ParlayItemManager.getAvailableItems().filter(createFilterFor(query)) : ParlayItemManager.getAvailableItems();
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

    }

    function ParlayItemSearch() {
        return {
            scope: {},
            templateUrl: '../parlay_components/items/directives/parlay-item-search.html',
            controller: 'ParlayItemSearchController',
            controllerAs: "ctrl"
        };
    }

}());