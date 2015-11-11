function ParlaySidenav() {
	return {
		scope: {},
		templateUrl: "../parlay_components/navigation/directives/parlay-sidenav.html",
		controller: "ParlaySidenavController",
		controllerAs: "ctrl"
	};
}

function ParlaySidenavController($mdSidenav, $state) {
    "use strict";

	/**
	 * Closes $mdSidenav
	 */
	this.closeSidenav = function() {
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

	this.states = this.getStates();
	
}

angular.module("parlay.sidenav", ["ngMaterial", "ui.router"])
	.controller("ParlaySidenavController", ["$mdSidenav", "$state", ParlaySidenavController])
	.directive("parlaySidenav", [ParlaySidenav]);