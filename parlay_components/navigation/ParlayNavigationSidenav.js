(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.items.search", "parlay.protocols.list_controller", "parlay.settings.dialog", "parlay.common.genericsaveloaddialog", "parlay.items.manager", "parlay.widget.manager"];

    angular.module("parlay.navigation.sidenav", module_dependencies)
        .controller("ParlayNavigationSidenavController", ParlayNavigationSidenavController);

    /* istanbul ignore next */
    ParlayNavigationSidenavController.$inject = ["$mdSidenav", "$mdDialog", "ParlayGenericSaveLoadDialog", "$state", "PromenadeBroker", "ParlayItemManager", "ParlayWidgetManager"];
    /**
     * Controller for the navigation $mdSidenav.
     * @constructor module:ParlayNavigation.ParlayNavigationSidenavController
     * @param {Object} $mdSidenav - Angular Material service.
     * @param {Object} $mdDialog - Angular Material service.
     * @param {Object} ParlayGenericSaveLoadDialog
     * @param {Object} $state - ui.router $stateProvider service.
     * @param {Object} PromenadeBroker - PromenadeBroker service.
     * @param {Object} ParlayItemManager - ParlayItemManager service.
     */
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

        // The below methods are only appropriate based on the given state.

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
                children: "widgets"
            });
        };

    }

}());
