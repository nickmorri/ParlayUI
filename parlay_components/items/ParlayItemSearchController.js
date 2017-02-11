(function () {
    "use strict";

    var module_dependencies = ['templates-main', 'parlay.items.manager', 'parlay.widget.manager', 'RecursionHelper'];

    angular
        .module('parlay.items.search', module_dependencies)
        .directive('parlayItemLibrarySidenav', ParlayItemLibrarySidenav)
        .directive('parlayItemList', ParlayItemList)
        .controller('ParlayItemListController', ParlayItemListController)
        .controller('ParlayItemSearchController', ParlayItemSearchController);

    ParlayItemSearchController.$inject = ['$scope', '$mdSidenav', 'ParlayItemManager', 'ParlayWidgetManager'];
    /**
     * Handles providing [ParlayItem]{@link module:ParlayItem.ParlayItem}s to the mdAutocomplete directive.
     * @constructor module:ParlayItem.ParlayItemSearchController
     * @param {Object} $scope - AngularJS $scope Object.
     * @param {Object} $mdSidenav - Angular Material sidenav service.
     * @param {Object} $mdDialog - Angular Material dialog service.
     * @param {Object} ParlayItemManager - ParlayItemManager service.
     */
    function ParlayItemSearchController ($scope, $mdSidenav, ParlayItemManager, ParlayWidgetManager) {

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
        ctrl.closeSearch = closeSearch;

        /**
         * On event handler for user selection of [ParlayItem]{@link module:ParlayItem.ParlayItem}.
         * @member module:ParlayItem.ParlayItemSearchController#selectItem
         * @public
         * @param item
         */
        function selectItem (item) {
            // Change is detected after we set item to null.
            if (item === null || item === undefined || !item.id) {
                return;
            }

            $scope.search_text = null;
            $scope.selected_item = null;

            // Hide sidenav after selecting item on smaller screen sizes where the sidenav is initially hidden.
            if (!$mdSidenav("navigation").isLockedOpen()) {
                $mdSidenav("navigation").close();
            }
            ParlayWidgetManager.add("StandardItem", item);
        }

        /**
         * Search for items.
         * @member module:ParlayItem.ParlayItemSearchController#querySearch
         * @public
         * @param {String} query - Name of item to find.
         */
        function querySearch (query) {
            function compare(item1, item2) {
                return item1.name.toString().toLowerCase() > item2.name.toString().toLowerCase();
            }

            var items = ParlayItemManager.getAvailableItems().sort(compare);

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

        function closeSearch() {
            $mdSidenav('itemNav').toggle();
        }
    }

    function ParlayItemLibrarySidenav () {
        return {
            restrict: "E",
            templateUrl: "../parlay_components/items/directives/parlay-item-library-sidenav.html",
            controller: "ParlayItemSearchController",
            controllerAs: "itemNav"
        };
    }

    ParlayItemListController.$inject = ["$scope", "$mdSidenav", "ParlayWidgetManager"];
    function ParlayItemListController($scope, $mdSidenav, ParlayWidgetManager) {
        var ctrl = this;
        ctrl.toggle = toggle;
        ctrl.selectItem = selectItem;

        $scope.hidden = true;
        $scope.icon = "expand_more";

        /**
         * Toggles the item to show its children in the item sidenav
         * @member module:ParlayItem.ParlayItemSearchController#toggle
         * @public
         * @param item
         */
        function toggle() {
            $scope.hidden = !$scope.hidden;
            $scope.icon = $scope.hidden ? "expand_more" : "expand_less";
        }

        function selectItem (item) {
            // Change is detected after we set item to null.
            if (item === null || item === undefined || !item.id) {
                return;
            }

            $scope.search_text = null;
            $scope.selected_item = null;

            // Hide sidenav after selecting item on smaller screen sizes where the sidenav is initially hidden.
            if (!$mdSidenav("navigation").isLockedOpen()) {
                $mdSidenav("navigation").close();
            }
            ParlayWidgetManager.add("StandardItem", item);
        }
    }

    ParlayItemList.$inject = ["RecursionHelper"];
    function ParlayItemList(RecursionHelper) {
        return {
            restrict: "E",
            templateUrl: "../parlay_components/items/directives/parlay-item-list.html",
            controller: "ParlayItemListController",
            controllerAs: "itemList",
            compile: RecursionHelper.compile,
            scope: {
                item: "=",
                searchCtrl: "=",
                depth: "="
            }
        };
    }
}());