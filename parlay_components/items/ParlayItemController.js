/**
 * @name ParlayItemController
 * @param ParlayItemManager - Service that manages the available items.
 * @description
 * The ParlayItemController is a controller that manages the items currently active in the workspace.
 *
 */
function ParlayItemController(ParlayItemManager) {

    this.filterItems = function () {
        return ParlayItemManager.getActiveItems();
    };

    this.hasItems = function () {
        return ParlayItemManager.hasActiveItems();
    };

    this.reorder = function (index, distance) {
        ParlayItemManager.reorder(parseInt(index, 10), distance);
    };

    this.duplicate = function (index, uid) {
        ParlayItemManager.duplicateItem(parseInt(index, 10), uid);
    };

    this.deactivate = function (index) {
        ParlayItemManager.deactivateItem(parseInt(index, 10));
    };

}

function ParlayEmptyWorkspacePlaceholderController($mdSidenav) {

    this.focusItemSearch = function () {
        var sidenav = $mdSidenav("navigation");

        // ParlayItemSearch autocomplete element.
        var element = document.getElementById("item-search");

        // If sidenav is open, on screens gt-sm, focus the element.
        // Otherwise, on screens <= sm, open the sidenav then focus the element.
        if (sidenav.isOpen()) element.focus();
        else sidenav.open().then(function () { element.focus(); });
    };

}

function ParlayEmptyWorkspacePlaceholder () {
    return {
        templateUrl: '../parlay_components/items/directives/parlay-empty-workspace-placeholder.html',
        controller: "ParlayEmptyWorkspacePlaceholderController",
        controllerAs: "ctrl"
    };
}

angular.module("parlay.items.controller", ["parlay.items.manager"])
    .controller("ParlayEmptyWorkspacePlaceholderController", ["$mdSidenav", ParlayEmptyWorkspacePlaceholderController])
    .directive("parlayEmptyWorkspacePlaceholder", [ParlayEmptyWorkspacePlaceholder])
    .controller("ParlayItemController", ["ParlayItemManager", ParlayItemController]);