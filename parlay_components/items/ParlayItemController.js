(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.items.manager"];

    angular
        .module("parlay.items.controller", module_dependencies)
        .directive("parlayEmptyWorkspacePlaceholder", ParlayEmptyWorkspacePlaceholder)
        .controller("ParlayItemController", ParlayItemController);

    ParlayItemController.$inject = ["ParlayItemManager", "$mdSidenav"];
    /**
     * The ParlayItemController is a controller that interacts with the
     * [ParlayItemManager]{@link module:ParlayItem.ParlayItemManager} to manage [ParlayItem]{@link module:ParlayItem.ParlayItem}s in the items workspace.
     * @constructor module:ParlayItem.ParlayItemController
     * @param {Object} ParlayItemManager - Service that manages the available items.
     * @param {Object} $mdSidenav - Angular Material Service for $mdSidenav.
     */
    function ParlayItemController (ParlayItemManager, $mdSidenav) {

        this.filterItems = function () {
        /**
         *
         * @member module:ParlayItem.ParlayItemController#filterItems
         * @public
         * @returns {Array}
         */
            return ParlayItemManager.getActiveItems();
        };

        this.hasItems = function () {
        /**
         * True if the ParlayItemManager has active items, false otherwise.
         * @member module:ParlayItem.ParlayItemController#filterItems
         * @public
         * @returns {Boolean}
         */
            return ParlayItemManager.hasActiveItems();
        };

        this.reorder = function (index, distance) {
        /**
         *
         * @member module:ParlayItem.ParlayItemController#reorder
         * @public
         * @param {Number} index - Position of the item to move in the Array.
         * @param {Number} distance - Positive or negative distance of where to move the item.
         */
            ParlayItemManager.reorder(parseInt(index, 10), distance);
        };

        this.swap = function (indexA, indexB) {
        /**
         * Swap the items at the two given indices.
         * @member module:ParlayItem.ParlayItemController#swap
         * @public
         * @param {Number} indexA - Position of item A.
         * @param {Number} indexB - Position of item B.
         */
            ParlayItemManager.swap(indexA, indexB);
        };

        this.duplicate = function (index, uid) {
        /**
         * Copies the item at the given index.
         * @member module:ParlayItem.ParlayItemController#duplicate
         * @public
         * @param {Number} index
         * @param {Number} uid
         */
            ParlayItemManager.duplicateItem(parseInt(index, 10), uid);
        };

        this.deactivate = function (index) {
        /**
         * Deactivates the item at the given index.
         * @member module:ParlayItem.ParlayItemController#deactivate
         * @public
         * @param {Number} index
         */
            ParlayItemManager.deactivateItem(parseInt(index, 10));
        };

        this.focusItemSearch = function () {
        /**
         * Opens the sidenav and focuses on the item-search element.
         * @member module:ParlayItem.ParlayItemController#deactivate
         * @public
         */
            var sidenav = $mdSidenav("navigation");

            // ParlayItemSearch autocomplete element.
            var element = document.getElementById("item-search");

            // If sidenav is open, on screens gt-sm, focus the element.
            // Otherwise, on screens <= sm, open the sidenav then focus the element.
            if (sidenav.isLockedOpen()) {
                element.focus();
            }
            else {
                sidenav.open().then(function () {
                    element.focus();
                });
            }
        };

    }

    /**
     * Placeholder for an empty items workspace.
     * @constructor module:ParlayItem.ParlayEmptyWorkspacePlaceholder
     * @returns {Object}
     */
    function ParlayEmptyWorkspacePlaceholder () {
        return { templateUrl: '../parlay_components/items/directives/parlay-empty-workspace-placeholder.html' };
    }

}());