(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.manager", "parlay.item.manager", "parlay.data", 'parlay.items.search'];

    angular
        .module("parlay.workspaces.controller", module_dependencies)
        .controller("ParlayWorkspacesController", ParlayWorkspacesController);

    ParlayWorkspacesController.$inject = ["ParlayItemManager", "ParlayWidgetManager", "ParlayItemSearchController"];
    /**
     * Controller for the generic Workspace
     * @constructor module:ParlayWidget.ParlayWidgetController
     */

    function ParlayWorkspacesController (ParlayItemManager, ParlayItemSearchController, ParlayWidgetManager) {
        var ctrl = this;

        ctrl.addWidget = addWidget;
        ctrl.addItem = addItem;

        function addItem() {
            $mdDialog.show({
                templateUrl: "../parlay_components/items/directives/parlay-item-library-dialog.html",
                controller: "ParlayItemSearchController",
                controllerAs: "ctrl",
                clickOutsideToClose: true
            });
        }

        function addWidget() {
            ParlayWidgetManager.add();
        }
    }

}());