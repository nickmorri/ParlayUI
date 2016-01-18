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

angular.module("parlay.items.controller", ["parlay.items.manager"])
    .controller("ParlayItemController", ["ParlayItemManager", ParlayItemController]);