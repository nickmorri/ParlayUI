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
            if (query === null || query === undefined || query === "")
                return true;
            return item.matchesQuery(lowercase_query);
        };
    }

    function queryMatchesNode(item, query) {
        return createFilterFor(query)(item);
    }

    function queryMatchesChildren(item, query) {
        if (!!item.children) {
            for (var i = 0; i < item.children.length; ++i) {
                if (queryMatchesBranch(item.children[i], query))
                    return true;
            }
        }
        return false;
    }

    function queryMatchesBranch(item, query) {
        if (queryMatchesNode(item, query))
            return true;
        return queryMatchesChildren(item, query);
    }

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

        /**
         * Create filter function for a query string
         * @member module:ParlayItem.ParlayItemSearchController#createFilterFor
         * @private
         * @param {String} query - Name of item to query by.
         */
        $scope.search_text = null;

        ctrl.selectItem = selectItem;
        ctrl.hasDiscovered = hasDiscovered;
        ctrl.closeSearch = closeSearch;
        ctrl.getItems = getItems;
        ctrl.filterNode = filterNode;
        ctrl.querySearchLinear = querySearchLinear;

        $scope.$on("ParlayItemSelected", function(event, item) {
            ctrl.selectItem(item);
        });

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
            ParlayWidgetManager.add("StandardItem", item);
        }

        /**
         * Linear BFS search. Will return ALL items in the item tree that match query
         * @member module:ParlayItem.ParlayItemSearchController#querySearchLinear
         * @public
         * @param {String} query - Name of item to find.
         */
        function querySearchLinear(query) {
            var results = [];
            function BFSLinearFilter(items) {
                items.forEach(function(item) {
                    if (createFilterFor(query)(item)) {
                        results.push(item);
                    }
                    if (!!item.children) {
                        BFSLinearFilter(item.children);
                    }
                });
            }
            var items = ParlayItemManager.getAvailableItems();
            if (query === null || query === undefined || query === "")
                return items;

            BFSLinearFilter(items);
            return results;
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
            $mdSidenav('parlay-item-library').toggle();
        }

        function getItems() {
            return ParlayItemManager.getAvailableItems();
        }

        function filterNode(item) {
            var query = $scope.search_text;
            return queryMatchesNode(item, query);
        }
    }

    ParlayItemListController.$inject = ["$scope"];
    function ParlayItemListController($scope) {
        var ctrl = this;

        ctrl.toggle = toggle;
        ctrl.select = select;
        ctrl.filterBranch = filterBranch;
        ctrl.filterNode = filterNode;

        $scope.hidden = true;
        $scope.search_text = null;

        $scope.user_override = false;
        $scope.sys_override = false;

        $scope.$on("ParlayItemLibraryQueryChanged", function(event, data) {
            $scope.search_text = data;
            $scope.sys_override = true;

            if (data === "" || data === null || data === undefined)
               if (!$scope.user_override)
                   $scope.hidden = true;
        });

        /**
         * Toggles the item to show its children in the item sidenav
         * @member module:ParlayItem.ParlayItemSearchController#toggle
         * @public
         * @param item
         */
        function toggle() {
            $scope.user_override = $scope.hidden;
            $scope.hidden = !$scope.hidden;
            $scope.sys_override = false;
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
            var query = $scope.search_text;
            var is_matching = queryMatchesNode(item, query);
            var has_matching_children = queryMatchesChildren(item, query);

            var match = has_matching_children || is_matching;

            if (queryExists(query) && has_matching_children) {
                if ($scope.sys_override)
                    $scope.hidden = !has_matching_children;
            }
            return match;
        }

        /**
         * A function that returns true if the item passed matches the provided query and false if otherwise
         * @param item
         * @returns {Boolean}
         */
        function filterNode(item) {
            var query = $scope.search_text;
            return queryMatchesNode(item, query);
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