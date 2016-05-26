(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.items.search", "parlay.protocols.list_controller", "parlay.settings.dialog", "parlay.common.genericsaveloaddialog", "parlay.items.manager"];

    angular.module("parlay.navigation.sidenav", module_dependencies)
        .controller("ParlayNavigationSidenavController", ParlayNavigationSidenavController);

    /* istanbul ignore next */
    ParlayNavigationSidenavController.$inject = ["$mdSidenav", "$mdDialog", "ParlayGenericSaveLoadDialog", "$state", "PromenadeBroker", "ParlayItemManager"];
    function ParlayNavigationSidenavController($mdSidenav, $mdDialog, ParlayGenericSaveLoadDialog, $state, PromenadeBroker, ParlayItemManager) {

        this.getCurrentState = function () {
            return $state.current;
        };

        this.getAllStates = function () {
            return $state.get().filter(function (state) {
                return !state.abstract;
            });
        };

        this.navigateState = function (state) {
            $state.go(state);
        };

        this.openProtocolManagementDialog = function (event) {
            $mdDialog.show({
                templateUrl: "../parlay_components/protocols/directives/parlay-protocol-list-dialog.html",
                targetEvent: event,
                controller: "ParlayProtocolListController",
                controllerAs: "ctrl",
                clickOutsideToClose: true
            });
        };

        this.requestDiscovery = function () {
            PromenadeBroker.requestDiscovery(true);
        };

        this.openWorkspaceManagementDialog = function (event) {
            (new ParlayGenericSaveLoadDialog(event, ParlayItemManager, {
                entry: "workspace",
                entries: "workspaces",
                title: "workspaces",
                child: "item",
                children: "items"
            }));
        };

        this.openNotificationSidenav = function () {
            $mdSidenav("notifications").open();
        };

        this.openHelpTab = function () {
            window.open(window.location.origin + "/docs", '_blank').focus();
        };

        this.openSettingsDialog = function (event) {
            $mdDialog.show({
                templateUrl: "../parlay_components/settings/directives/parlay-settings-dialog.html",
                targetEvent: event,
                controller: "ParlaySettingsDialogController",
                controllerAs: "ctrl",
                clickOutsideToClose: true
            });
        };

    }

}());