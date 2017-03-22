(function () {
    "use strict";

    var module_dependencies = ['templates-main', 'parlay.items.manager', 'parlay.widget.manager', 'RecursionHelper', 'ngAnimate', 'ng-slide-down'];

    angular
        .module('parlay.items.search', module_dependencies)
        .directive('parlayItemLibrarySidenav', ParlayItemLibrarySidenav)
        .directive('parlayItemList', ParlayItemList)
        .controller('ParlayItemSearchController', ParlayItemSearchController)
        .controller('ParlayItemListController', ParlayItemListController);


    /**
     * Create filter function for a query string
     * @member module:ParlayItem.ParlayItemSearchController#createFilterFor
     * @private
     * @param {String} query - Name of item to query by.
     */
    function createFilterFor (query) {
        var lowercase_query = angular.lowercase(query);
        return function filterFn(item) {
            if (query === null || query === undefined || query === "")
                return true;
            return item.matchesQuery(lowercase_query);
        };
    }

    /**
     * Helper function which returns true if the query provided matches with the item
     * @param item - ParlayItem/PromenadeStandardItem
     * @param query - String
     * @returns {Boolean}
     */
    function queryMatchesNode(item, query) {
        return createFilterFor(query)(item);
    }

    /**
     * Helper function which returns true if the query provided matches with the item's children
     * @param item - ParlayItem/PromenadeStandardItem
     * @param query - String
     * @returns {Boolean}
     */
    function queryMatchesChildren(item, query) {
        if (!!item.children) {
            for (var i = 0; i < item.children.length; ++i) {
                if (queryMatchesBranch(item.children[i], query))
                    return true;
            }
        }
        return false;
    }

    /**
     * Helper function which returns true if the query provided matches with the item or its children
     * @param item - ParlayItem/PromenadeStandardItem
     * @param query - String
     * @returns {Boolean}
     */
    function queryMatchesBranch(item, query) {
        if (queryMatchesNode(item, query))
            return true;
        return queryMatchesChildren(item, query);
    }

    /**
     * Returns true if a query variable exists.
     * @param query
     * @returns {boolean}
     */
    function queryExists(query) {
        return query !== "" && query !== null && query !== undefined;
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
        $scope.search_text = null;

        ctrl.selectItem = selectItem;
        ctrl.hasDiscovered = hasDiscovered;
        ctrl.closeSearch = closeSearch;
        ctrl.getItems = getItems;
        ctrl.filterNode = filterNode;
        ctrl.queryCheck = queryCheck;

        /**
         * When a child controller alerts that an item has been selected,
         * instantiate the item into the workspace
         */
        $scope.$on("ParlayItemSelected", function(event, item) {
            ctrl.selectItem(item);
        });

        /**
         * When the search query is changed, alert the children controllers of the change
         */
        $scope.$watch("search_text", function() {
           $scope.$broadcast("ParlayItemLibraryQueryChanged", $scope.search_text);
        });

        /**
         * On event handler for user selection of [ParlayItem]{@link module:ParlayItem.ParlayItem}.
         * @member module:ParlayItem.ParlayItemSearchController#selectItem
         * @public
         * @param item
         */
        function selectItem (item) {
            // if item selected does not actually exist, or does not have an item id, do not instantiate it
            if (item === null || item === undefined || !item.id) {
                return;
            }

            // Hide sidenav after selecting item on smaller screen sizes where the sidenav is initially hidden.
            if (!$mdSidenav("navigation").isLockedOpen()) {
                $mdSidenav("navigation").close();
            }
            ParlayWidgetManager.add("StandardItem", item.id);
        }

        /**
         * True if discovered, false otherwise.
         * @member module:ParlayItem.ParlayItemSearchController#hasDiscovered
         * @public
         * @returns {Boolean}
         */
        function hasDiscovered () {
            return ParlayItemManager.hasDiscovered();
        }

        /**
         * Controller function to close the item library sidenav
         * @member module:ParlayItem.ParlayItemSearchController#closeSearch
         */
        function closeSearch() {
            $mdSidenav('parlay-item-library').toggle();
        }

        /**
         * General Function which will return all items from the current discovery
         * @member module:ParlayItem.ParlayItemSearchController#getItems
         * @returns {*|Array}
         */
        function getItems() {
            return ParlayItemManager.getAvailableItems();
        }

        /**
         * Returns true if the item passed to it directly matches the query.
         * Does not check children for query matching
         * @member module:ParlayItem.ParlayItemSearchController#filterNode
         * @param item
         * @returns {Boolean}
         */
        function filterNode(item) {
            return queryMatchesNode(item, $scope.search_text);
        }

        function queryCheck() {
            var items = ctrl.getItems();
            var count = 0;
            for (var i = 0; i < items.length; i++) {
                if (queryMatchesBranch(items[i], $scope.search_text))
                    count++;
            }
            return count > 0;
        }
    }

    ParlayItemListController.$inject = ["$scope"];
    /**
     * Controller for an item and its children.  This controller works with the Item Library controller to communicate
     * items needed to be created in the workspace, and for filtering with the search queries provided by the Search/Library
     * controller
     * @param $scope - AngularJS scope object
     * @constructor
     */
    function ParlayItemListController($scope) {
        var ctrl = this;

        ctrl.toggle = toggle;
        ctrl.select = select;
        ctrl.filterBranch = filterBranch;
        ctrl.filterNode = filterNode;

        $scope.show_children = false;
        $scope.filter_state = null;
        $scope.user_state = false;
        $scope.search_text = null;

        /**
         *
         */
        $scope.$on("ParlayItemLibraryQueryChanged", function(event, data) {
            $scope.search_text = data;
            if (!queryExists($scope.search_text)) {
                $scope.show_children = $scope.user_state;
                $scope.filter_state = null;
            }
        });

        /**
         * Toggles the item to show its children in the item sidenav
         * @member module:ParlayItem.ParlayItemSearchController#toggle
         * @public
         * @param item
         */
        function toggle() {

            if (queryExists($scope.search_text)) {
                $scope.filter_state = !$scope.filter_state;
                $scope.show_children = $scope.filter_state;
            } else {
                $scope.show_children = !$scope.show_children;
                $scope.user_state = $scope.show_children;
            }
        }

        /**
         * function that emits an event to the root scope containing the item to be instantiated into the workspace
         */
        function select() {
            $scope.$emit("ParlayItemSelected", $scope.item);
        }

        /**
         * a filter function returning true if the item node provided or ANY descendants matches the query
         * @param item - PromenadeStandardItem
         * @returns {Boolean}
         */
        function filterBranch(item) {
            if (!queryExists($scope.search_text))
                return true;

            var is_matching = queryMatchesNode(item, $scope.search_text);
            var has_matching_children = queryMatchesChildren(item, $scope.search_text);

            if (has_matching_children) {
                if ($scope.filter_state === null)
                    $scope.filter_state = true;
                $scope.show_children = $scope.filter_state;
            }

            return has_matching_children || is_matching;
        }

        /**
         * A function that returns true if the item passed matches the provided query and false if otherwise
         * @param item
         * @returns {Boolean}
         */
        function filterNode(item) {
            return queryMatchesNode(item, $scope.search_text);
        }
    }

    /**
     * Container Directive that has filter input form for filtering items and a hierarchical
     * display of all items in the discovery tree
     */
    function ParlayItemLibrarySidenav () {
        return {
            restrict: "E",
            templateUrl: "../parlay_components/items/directives/parlay-item-library-sidenav.html",
            controller: "ParlayItemSearchController",
            controllerAs: "searchCtrl"
        };
    }

    ParlayItemList.$inject = ["RecursionHelper"];
    /**
     * Recursive directive that will produce a menu list of children items until the item has no children to display
     * @param RecursionHelper
     *
     */
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
                matchingAncestor: "="
            }
        };
    }
}());