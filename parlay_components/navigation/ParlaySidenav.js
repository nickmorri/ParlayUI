function ParlaySidenav() {
	return {
		scope: {},
		templateUrl: "../parlay_components/navigation/directives/parlay-sidenav.html",
		controller: "ParlaySidenavController",
		controllerAs: "ctrl"
	};
}

function ParlaySidenavController($mdSidenav) {
	
	this.closeSidenav = function () {
		$mdSidenav("navigation").close();
	};
	
}

angular.module("parlay.sidenav", [])
	.controller("ParlaySidenavController", ["$mdSidenav", ParlaySidenavController])
	.directive("parlaySidenav", [ParlaySidenav]);