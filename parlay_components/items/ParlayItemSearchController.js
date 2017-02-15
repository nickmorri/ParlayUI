(function () {
    "use strict";

    var module_dependencies = ['templates-main', 'parlay.items.manager', 'parlay.widget.manager', 'RecursionHelper', 'ngAnimate', 'ng-slide-down'];

    angular
        .module('parlay.items.search', module_dependencies)
        .directive('parlayItemLibrarySidenav', ParlayItemLibrarySidenav)
        .directive('parlayItemList', ParlayItemList)
        .controller('ParlayItemListController', ParlayItemListController)
        .controller('ParlayItemSearchController', ParlayItemSearchController);


    function createFilterFor (query) {
        var lowercase_query = angular.lowercase(query);

        return function filterFn(item) {
            return item.matchesQuery(lowercase_query);
        };
    }

    function queryMatchesBranch(item, query) {
        if (query === null || query === undefined || query === "")
            return true;
        if (createFilterFor(query)(item))
            return true;
        if (!!item.children) {
            for (var i = 0; i < item.children.length; ++i) {
                if (queryMatchesBranch(item.children[i], query))
                    return true;
            }
        }
        return false;
    }


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
        $scope.search_text = null;

        ctrl.selectItem = selectItem;
        ctrl.querySearch = querySearch;
        ctrl.hasDiscovered = hasDiscovered;
        ctrl.closeSearch = closeSearch;
        ctrl.items = allItems;
        ctrl.filter = filter;

        $scope.$on("ParlayItemSelected", function(event, item) {
            ctrl.selectItem(item);
        });

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

            // Hide sidenav after selecting item on smaller screen sizes where the sidenav is initially hidden.
            if (!$mdSidenav("navigation").isLockedOpen()) {
                $mdSidenav("navigation").close();
            }
            ParlayWidgetManager.add("StandardItem", item);
        }

        function breadthFirstFilter(items, query) {
            var results = [];

            items.forEach(function(item) {
                if (queryMatchesBranch(item, query))
                    results.push(item);
            });

            return results;
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

            return query ? breadthFirstFilter(items, query) : items;
        }

        // function hasMatchingDescendant(item, query)

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
            $mdSidenav('parlay-item-library').toggle();
        }

        function allItems() {
            return ParlayItemManager.getAvailableItems();
        }

        function filter(item) {
            var query = $scope.search_text;
            return queryMatchesBranch(item, query);
        }
    }

    ParlayItemListController.$inject = ["$scope"];
    function ParlayItemListController($scope) {
        var ctrl = this;
        ctrl.toggle = toggle;
        ctrl.select = select;
        ctrl.filter = filter;

        $scope.hidden = true;


        /**
         * Toggles the item to show its children in the item sidenav
         * @member module:ParlayItem.ParlayItemSearchController#toggle
         * @public
         * @param item
         */
        function toggle() {
            $scope.hidden = !$scope.hidden;
        }

        function select() {
            $scope.$emit("ParlayItemSelected", $scope.item);
        }

        function filter(item) {
            var query = angular.element(document.getElementById("parlay-item-library")).scope().search_text;
            return queryMatchesBranch(item, query);
        }
    }

    function ParlayItemLibrarySidenav () {
        return {
            restrict: "E",
            templateUrl: "../parlay_components/items/directives/parlay-item-library-sidenav.html",
            controller: "ParlayItemSearchController",
            controllerAs: "searchCtrl"
        };
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
                depth: "=",
                children: "="
            }
        };
    }
}());