function ParlayNavigationSidenavController($mdSidenav, $mdDialog, $mdMedia, PromenadeBroker) {
    "use strict";

	this.openWorkspaceManagementDialog = function (event) {
		/* istanbul ignore next */
		$mdDialog.show({
			templateUrl: "../parlay_components/items/directives/parlay-workspace-management-dialog.html",
			targetEvent: event,
			controller: "ParlayWorkspaceManagementController",
			controllerAs: "ctrl",
			clickOutsideToClose: true,
			fullscreen: !$mdMedia("gt-sm")
		});
	};

	this.openProtocolManagementDialog = function (event) {
		/* istanbul ignore next */
		$mdDialog.show({
			templateUrl: "../parlay_components/protocols/directives/parlay-protocol-list-dialog.html",
			targetEvent: event,
			controller: "ParlayProtocolListController",
			controllerAs: "ctrl",
			clickOutsideToClose: true,
			fullscreen: !$mdMedia("gt-sm")
		});
	};

	this.requestDiscovery = function () {
		PromenadeBroker.requestDiscovery(true);
	};

	this.openNotificationSidenav = function () {
		/* istanbul ignore next */
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
            clickOutsideToClose: true,
            fullscreen: !$mdMedia("gt-sm")
		});
	};
	
}

angular.module("parlay.navigation.sidenav", ["ngMaterial", "parlay.items.search", "parlay.protocols.list_controller", "parlay.settings.dialog", "parlay.items.workspaces"])
	.controller("ParlayNavigationSidenavController", ["$mdSidenav", "$mdDialog", "$mdMedia", "PromenadeBroker", ParlayNavigationSidenavController]);