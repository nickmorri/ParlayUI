(function () {
    "use strict";

    /**
     * @name ItemsConfiguration
     * @param $stateProvider - Service provided by ui.router
     * @description - The ItemsConfiguration sets up the items state.
     */

    function ItemsConfiguration($stateProvider) {
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

    angular.module("parlay.items", ["ui.router", "parlay.items.controller"])
        .config(["$stateProvider", ItemsConfiguration]);

}());