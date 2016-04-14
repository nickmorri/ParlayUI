(function () {
    "use strict";

    /* istanbul ignore next */
    function ParlayNavigationSidenavController($mdSidenav, $mdDialog, $state, PromenadeBroker) {

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
            $mdDialog.show({
                templateUrl: "../parlay_components/items/directives/parlay-workspace-management-dialog.html",
                targetEvent: event,
                controller: "ParlayWorkspaceManagementController",
                controllerAs: "ctrl",
                clickOutsideToClose: true
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

    angular.module("parlay.navigation.sidenav", ["ngMaterial", "parlay.items.search", "parlay.protocols.list_controller", "parlay.settings.dialog", "parlay.items.workspaces"])
        .controller("ParlayNavigationSidenavController", ["$mdSidenav", "$mdDialog", "$state", "PromenadeBroker", ParlayNavigationSidenavController]);

}());