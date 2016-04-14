(function () {
    "use strict";

    var module_dependencies = ["ui.router", "parlay.items.controller"];

    angular
        .module("parlay.items", module_dependencies)
        .config(ItemsConfiguration);

    /**
     * @name ItemsConfiguration
     * @param $stateProvider - Service provided by ui.router
     * @description - The ItemsConfiguration sets up the items state.
     */

    ItemsConfiguration.$inject = ["$stateProvider"];
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