/**
 * @name ParlayItemController
 * @param {Parlay Service} ParlayItemManager - Service that manages the available items.
 * @param {Angular Material Service} $mdSidenav - Angular Material Service for $mdSidenav.  
 * @description
 * The ParlayItemController is a controller that manages the items currently active in the workspace.
 *
 */
function ParlayItemController(ParlayItemManager, $mdSidenav) {

    this.filterItems = function () {
        return ParlayItemManager.getActiveItems();
    };

    this.hasItems = function () {
        return ParlayItemManager.hasActiveItems();
    };

    this.reorder = function (index, distance) {
        ParlayItemManager.reorder(parseInt(index, 10), distance);
    };

    this.swap = function (indexA, indexB) {
        ParlayItemManager.swap(indexA, indexB);
    };

    this.duplicate = function (index, uid) {
        ParlayItemManager.duplicateItem(parseInt(index, 10), uid);
    };

    this.deactivate = function (index) {
        ParlayItemManager.deactivateItem(parseInt(index, 10));
    };

    this.focusItemSearch = function () {
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

function ParlayEmptyWorkspacePlaceholder () {
    return { templateUrl: '../parlay_components/items/directives/parlay-empty-workspace-placeholder.html' };
}

angular.module("parlay.items.controller", ["ngMaterial", "parlay.items.manager"])
    .directive("parlayEmptyWorkspacePlaceholder", [ParlayEmptyWorkspacePlaceholder])
    .controller("ParlayItemController", ["ParlayItemManager", "$mdSidenav", ParlayItemController]);