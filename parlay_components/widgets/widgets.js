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

function ParlayWidgetsController($mdDialog) {
    this.items = [];

    this.add = function () {
        $mdDialog.show({
            templateUrl: "../parlay_components/widgets/directives/parlay-base-widget-configuration-dialog.html",
            clickOutsideToClose: true,
            controller: "ParlayBaseWidgetConfigurationDialogController",
            controllerAs: "dialogCtrl",
            locals: {
                configuration: {
                    selectedItem: undefined,
                    transform: function (input) { return input; }.toString()
                }
            },
            bindToController: true
        }).then(function (result) {
            this.items.push({
                data: result.selectedItem,
                transform: eval("(" + result.transform + ")")
            });
        }.bind(this));
    };
    
    this.edit = function (item) {

        $mdDialog.show({
            templateUrl: "../parlay_components/widgets/directives/parlay-base-widget-configuration-dialog.html",
            clickOutsideToClose: true,
            controller: "ParlayBaseWidgetConfigurationDialogController",
            controllerAs: "dialogCtrl",
            locals: {
                configuration: {
                    selectedItem: item.data,
                    transform: item.transform.toString()
                }
            },
            bindToController: true
        }).then(function (result) {

            this.items.splice(this.items.findIndex(function (current) {
                return current.data == item.data;
            }), 1);

            this.items.push({
                data: result.selectedItem,
                transform: eval("(" + result.transform + ")")
            });
        }.bind(this));
    };
    
}

angular.module("parlay.widgets", ["ui.router", "ui.ace", "ngMaterial", "parlay.widgets.base"])
    .config(WidgetsConfiguration)
    .controller("ParlayWidgetsController", ["$mdDialog", ParlayWidgetsController]);