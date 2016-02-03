function ParlayNavigationSidenavController($mdSidenav, $mdDialog, $mdMedia, PromenadeBroker) {
    "use strict";

	this.requestDiscovery = function () {
		PromenadeBroker.requestDiscovery(true);
	};

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
			templateUrl: "../parlay_components/communication/directives/parlay-connection-list-dialog.html",
			targetEvent: event,
			controller: "ParlayConnectionListController",
			controllerAs: "ctrl",
			clickOutsideToClose: true,
			fullscreen: !$mdMedia("gt-sm")
		});
	};

	this.openNotificationDisplay = function () {
		/* istanbul ignore next */
		$mdSidenav("notifications").open();
	};

	this.saveDiscovery = function () {
		var time = new Date();
        PromenadeBroker.getLastDiscovery().download("discovery_" + time.toISOString() + ".txt");
	};

	this.loadDiscovery = function (event) {
        event.target.getElementsByTagName("input")[0].click();
	};

	this.fileChanged = function (event) {

		// Instantiate FileReader object
		var fileReader = new FileReader();

		// After file load pass saved discovery data to the PromenadeBroker
		fileReader.onload = function (event) {
			PromenadeBroker.setSavedDiscovery(JSON.parse(event.target.result));
		};

		// Read file as text
		fileReader.readAsText(event.target.files[0]);
	};
	
}

angular.module("parlay.navigation.sidenav", ["ngMaterial", "parlay.utility", "promenade.broker", "parlay.items.search"])
	.controller("ParlayNavigationSidenavController", ["$mdSidenav", "$mdDialog", "$mdMedia", "PromenadeBroker", ParlayNavigationSidenavController]);