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

function ParlayEditorController($scope) {
    $scope.items = [];
}

angular.module("parlay.widgets", ["ui.router", "ui.ace"])
    .config(WidgetsConfiguration)
    .controller("ParlayWidgetsController", ["$scope", ParlayEditorController]);