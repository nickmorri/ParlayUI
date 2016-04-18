// Holds the module dependencies for ParlayWidget. Creating this Array on the Global scope allows for other modules,
// such as vendor defined widgets to include themselves as ParlayWidget dependencies.
var widget_dependencies = ["ui.router", "ui.ace", "ngMaterial", "parlay.widgets.base"];

(function (module_dependencies) {
    "use strict";

    angular
        .module("parlay.widgets", module_dependencies)
        .config(WidgetsConfiguration)
        .controller("ParlayWidgetsController", ParlayWidgetsController);

    /**
     * @name WidgetsConfiguration
     * @param $stateProvider - Service provided by ui.router
     * @description - The WidgetsConfiguration sets up the items state.
     */
    function WidgetsConfiguration($stateProvider) {
        $stateProvider.state("widgets", {
            url: "/widgets",
            templateUrl: "../parlay_components/widgets/views/base.html",
            controller: "ParlayWidgetsController",
            controllerAs: "widgetsCtrl",
            data: {
                displayName: "Widgets",
                displayIcon: "create"
            }
        });
    }

    function ParlayWidgetsController() {
        this.items = [];
    }

    ParlayWidgetsController.prototype.add = function () {
        this.items.push({});
    };

    ParlayWidgetsController.prototype.remove = function (index) {
        this.items.splice(index, 1);
    };

}(widget_dependencies));