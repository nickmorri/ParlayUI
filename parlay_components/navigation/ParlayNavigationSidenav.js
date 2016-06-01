(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.items.search", "parlay.protocols.list_controller", "parlay.settings.dialog", "parlay.common.genericsaveloaddialog", "parlay.items.manager", "parlay.widget.manager"];

    angular.module("parlay.navigation.sidenav", module_dependencies)
        .controller("ParlayNavigationSidenavController", ParlayNavigationSidenavController);

    ParlayNavigationSidenavController.$inject = ["$mdSidenav", "$mdDialog", "ParlayGenericSaveLoadDialog", "$state", "PromenadeBroker", "ParlayItemManager", "ParlayWidgetManager"];
    /**
     * Controller for the navigation $mdSidenav.
     * @constructor module:ParlayNavigation.ParlayNavigationSidenavController
     * @param {Object} $mdSidenav - Angular Material service.
     * @param {Object} $mdDialog - Angular Material service.
     * @param {Object} ParlayGenericSaveLoadDialog - ParlayGenericSaveLoadDialog service.
     * @param {Object} $state - ui.router $stateProvider service.
     * @param {Object} PromenadeBroker - PromenadeBroker service.
     * @param {Object} ParlayItemManager - ParlayItemManager service.
     * @param {Object} ParlayWidgetManager - ParlayWidgetManager service.
     */
    function ParlayNavigationSidenavController($mdSidenav, $mdDialog, ParlayGenericSaveLoadDialog, $state, PromenadeBroker, ParlayItemManager, ParlayWidgetManager) {

        var ctrl = this;

        // Attach methods to controller.
        ctrl.getCurrentState = getCurrentState;
        ctrl.getAllStates = getAllStates;
        ctrl.navigateState = navigateState;
        ctrl.openProtocolManagementDialog = openProtocolManagementDialog;
        ctrl.requestDiscovery = requestDiscovery;
        ctrl.openNotificationSidenav = openNotificationSidenav;
        ctrl.openHelpTab = openHelpTab;
        ctrl.openSettingsDialog = openSettingsDialog;
        ctrl.requestDiscovery = requestDiscovery;
        ctrl.openItemSaveLoadDialog = openItemSaveLoadDialog;
        ctrl.toggleWidgetEditing = toggleWidgetEditing;
        ctrl.openWidgetSaveLoadDialog = openWidgetSaveLoadDialog;

        /**
         * Reference the editing state of the ParlayWidgetManager.
         * @member module:ParlayNavigation.ParlayNavigationSidenavController#editing
         * @public
         * @type {Boolean}
         */
        ctrl.editing = ParlayWidgetManager.editing;

        /**
         * Returns the current state Object from the ui.router $stateProvider.
         * @member module:ParlayNavigation.ParlayNavigationSidenavController#getCurrentState
         * @public
         * @returns {Object}
         */
        function getCurrentState () {
            return $state.current;
        }

        /**
         * Returns the all, non-abstract, state Objects from the ui.router $stateProvider.
         * @member module:ParlayNavigation.ParlayNavigationSidenavController#getAllStates
         * @public
         * @returns {Array}
         */
        function getAllStates () {
            return $state.get().filter(function (state) {
                return !state.abstract;
            });
        }

        /**
         * Request the ui.router $stateProvider to go to the given state.
         * @member module:ParlayNavigation.ParlayNavigationSidenavController#navigateState
         * @public
         * @param {Object} state - ui.router state Object to go to.
         * @returns {Array}
         */
        function navigateState (state) {
            $state.go(state);
        }

        function toggleWidgetEditing  () {
            ParlayWidgetManager.toggleEditing();
        }

        /**
         * Requests PromenadeBroker performs a discovery.
         * @member module:ParlayNavigation.ParlayNavigationSidenavController#requestDiscovery
         * @public
         */
        function requestDiscovery () {
            PromenadeBroker.requestDiscovery(true);
        }

        /**
         * Opens the notifications $mdSidenav.
         * @member module:ParlayNavigation.ParlayNavigationSidenavController#openNotificationSidenav
         * @public
         */
        function openNotificationSidenav () {
            $mdSidenav("notifications").open();
        }

        /**
         * Launches a new tab with the Parlay documentation.
         * @member module:ParlayNavigation.ParlayNavigationSidenavController#openNotificationSidenav
         * @public
         */
        function openHelpTab () {
            window.open(window.location.origin + "/docs", '_blank').focus();
        }

        /**
         * Launches a $mdDialog for the Parlay protocol list.
         * @member module:ParlayNavigation.ParlayNavigationSidenavController#openProtocolManagementDialog
         * @public
         * @param {Event} event - DOM Event that can be used to set an animation source for $mdDialog.
         */
        function openProtocolManagementDialog (event) {
            $mdDialog.show({
                templateUrl: "../parlay_components/protocols/directives/parlay-protocol-list-dialog.html",
                targetEvent: event,
                controller: "ParlayProtocolListController",
                controllerAs: "ctrl",
                clickOutsideToClose: true
            });
        }

        /**
         * Launches a $mdDialog for Parlay settings.
         * @member module:ParlayNavigation.ParlayNavigationSidenavController#openSettingsDialog
         * @public
         * @param {Event} event - DOM Event that can be used to set an animation source for $mdDialog.
         */
        function openSettingsDialog (event) {
            $mdDialog.show({
                templateUrl: "../parlay_components/settings/directives/parlay-settings-dialog.html",
                targetEvent: event,
                controller: "ParlaySettingsDialogController",
                controllerAs: "ctrl",
                clickOutsideToClose: true
            });
        }

        /**
         * Launches a ParlayGenericSaveLoadDialog for item workspace management.
         * @member module:ParlayNavigation.ParlayNavigationSidenavController#openWorkspaceManagementDialog
         * @public
         * @param {Event} event - DOM Event that can be used to set an animation source for $mdDialog.
         */
        function openItemSaveLoadDialog (event) {
            ParlayGenericSaveLoadDialog.show(event, ParlayItemManager, {
                entry: "workspace",
                entries: "workspaces",
                title: "workspaces",
                child: "item",
                children: "items"
            });
        }

        /**
         * Launches a ParlayGenericSaveLoadDialog for widgets workspace management.
         * @member module:ParlayNavigation.ParlayNavigationSidenavController#openWidgetSaveLoadDialog
         * @public
         * @param {Event} event - DOM Event that can be used to set an animation source for $mdDialog.
         */
        function openWidgetSaveLoadDialog (event) {
            ParlayGenericSaveLoadDialog.show(event, ParlayWidgetManager, {
                entry: "workspace",
                entries: "workspaces",
                title: "workspaces",
                child: "widget",
                children: "widgets"
            });
        }

    }

}());
