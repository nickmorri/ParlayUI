// Holds the module dependencies for ParlayWidget. Creating this Array on the Global scope allows for other modules,
// such as vendor defined widgets to include themselves as ParlayWidget dependencies.
var widget_dependencies = ["ui.router", "ui.ace", "ngMaterial", "parlay.widgets.base", "parlay.settings"];

(function (module_dependencies) {
    "use strict";

    angular
        .module("parlay.widgets", module_dependencies)
        .config(ParlayWidgetsConfiguration)
        .run(ParlayWidgetsRun)
        .controller("ParlayWidgetsController", ParlayWidgetsController);

    /**
     * @name WidgetsConfiguration
     * @param $stateProvider - Service provided by ui.router
     * @description - The WidgetsConfiguration sets up the items state.
     */
    function ParlayWidgetsConfiguration($stateProvider) {
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

    ParlayWidgetsRun.$inject = ["ParlaySettings"];
    function ParlayWidgetsRun (ParlaySettings) {
        ParlaySettings.registerDefault("widgets", {editing: true});

        if (!ParlaySettings.has("widgets")) {
            ParlaySettings.restoreDefault("widgets");
        }
    }

    ParlayWidgetsController.$inject = ["$scope", "ParlaySettings", "ParlayStore"];
    function ParlayWidgetsController ($scope, ParlaySettings, ParlayStore) {

        var settings = ParlaySettings.get("widgets");
        var store = ParlayStore("widgets");
        
        $scope.editing = settings.editing;

        this.items = [];

        this.save = function () {
            store.set("default", JSON.stringify(this.items));
        };

        this.load = function () {
            this.items = JSON.parse(store.get("default"));
        };

        $scope.$watch("editing", function (newValue) {
            ParlaySettings.set("widgets", {editing: newValue});
        });
    }

    ParlayWidgetsController.prototype.add = function () {
        this.items.push({});
    };

    ParlayWidgetsController.prototype.remove = function (index) {
        this.items.splice(index, 1);
    };

}(widget_dependencies));