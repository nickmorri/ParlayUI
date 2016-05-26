(function () {
    "use strict";

    var module_dependencies = ["ui.router", "parlay.items.controller"];

    angular
        .module("parlay.items", module_dependencies)
        .config(ItemsConfiguration);

    ItemsConfiguration.$inject = ["$stateProvider"];
    /**
     * The sets up the items state for ui.router.
     * @param {Object} $stateProvider - Service provided by ui.router
     */
    function ItemsConfiguration ($stateProvider) {
        $stateProvider.state("items", {
            url: "/items",
            templateUrl: "../parlay_components/items/views/base.html",
            controller: "ParlayItemController",
            controllerAs: "itemCtrl",
            data: {
                displayName: "Items",
                displayIcon: "extension"
            }
        });
    }

}());