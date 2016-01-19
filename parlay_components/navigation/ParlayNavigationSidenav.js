function ParlayNavigationSidenav() {
	return {
		scope: {},
		templateUrl: "../parlay_components/navigation/directives/parlay-navigation-sidenav.html",
		controller: "ParlayNavigationSidenavController",
		controllerAs: "ctrl"
	};
}

function ParlayNavigationSidenavController($mdSidenav, $state, PromenadeBroker) {
    "use strict";

	/**
	 * Closes $mdSidenav
	 */
	this.close = function() {
		$mdSidenav("navigation").close();
	};

	/**
	 * Sets current state to the given state and closes the sidenav.
	 * @param {Object} state - Object that holds the state details.
     */
	this.navigateToState = function(state) {
		$state.go(state.name);
		this.closeSidenav();
	};

    /**
     * Gets available states from UI-Router $state service.
     * @returns {Array} - Array of Objects that hold state details.
     */
	this.getStates = function() {
		return $state.get().filter(function(state) {
			return !state.abstract;
		}).map(function(state) {
			return {
				name: state.name,
				display: state.data.display,
				icon: state.data.icon
			};
		});
	};

	this.saveDiscovery = function () {
		var time = new Date();
        PromenadeBroker.getLastDiscovery().download("discovery_" + time.toISOString() + ".txt");
	};

	this.loadDiscovery = function (event) {
		event.target.parentElement.parentElement.parentElement.getElementsByTagName("input")[0].click();
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

	this.states = this.getStates();
	
}

angular.module("parlay.navigation.sidenav", ["ngMaterial", "ui.router", "parlay.utility", "promenade.broker"])
	.controller("ParlayNavigationSidenavController", ["$mdSidenav", "$state", "PromenadeBroker", ParlayNavigationSidenavController])
	.directive("parlayNavigationSidenav", [ParlayNavigationSidenav]);