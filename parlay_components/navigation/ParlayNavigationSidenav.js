(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.items.search", "parlay.protocols.list_controller", "parlay.settings.dialog", "parlay.common.genericsaveloaddialog", "parlay.items.manager", "parlay.widget.manager"];

    angular.module("parlay.navigation.sidenav", module_dependencies)
        .controller("ParlayNavigationSidenavController", ParlayNavigationSidenavController);

    /* istanbul ignore next */
    ParlayNavigationSidenavController.$inject = ["$mdSidenav", "$mdDialog", "ParlayGenericSaveLoadDialog", "$state", "PromenadeBroker", "ParlayItemManager", "ParlayWidgetManager"];
    function ParlayNavigationSidenavController($mdSidenav, $mdDialog, ParlayGenericSaveLoadDialog, $state, PromenadeBroker, ParlayItemManager, ParlayWidgetManager) {

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

        this.openItemSaveLoadDialog = function (event) {
            ParlayGenericSaveLoadDialog.show(event, ParlayItemManager, {
                entry: "workspace",
                entries: "workspaces",
                title: "workspaces",
                child: "item",
                children: "items"
            });
        };

        this.editing = ParlayWidgetManager.editing;

        this.toggleWidgetEditing = function () {
            ParlayWidgetManager.toggleEditing();
        };

        this.openWidgetSaveLoadDialog = function (event) {
            ParlayGenericSaveLoadDialog.show(event, ParlayWidgetManager, {
                entry: "workspace",
                entries: "workspaces",
                title: "workspaces",
                child: "widget",
                children: "widgetss"
            });
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