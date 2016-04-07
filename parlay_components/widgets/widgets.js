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

    this.add = function () {
        this.items.push({});
    };

    this.remove = function (index) {
        this.items.splice(index, 1);
    };

    this.getAllInputs = function () {
        return this.items.reduce(function (previous, current) {
            return previous.concat(current.controller.getInputs())
        }, []);
    };
    
}

angular.module("parlay.widgets", ["ui.router", "ui.ace", "ngMaterial", "parlay.widgets.base", "parlay.widgets.demo"])
    .config(WidgetsConfiguration)
    .controller("ParlayWidgetsController", [ParlayWidgetsController]);