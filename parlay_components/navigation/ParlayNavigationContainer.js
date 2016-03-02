/* istanbul ignore next */
function ParlayNavigationContainerController($mdSidenav) {

    this.toggleSidenav = function () {
        $mdSidenav("navigation").toggle();
    };

}

/* istanbul ignore next */
function ParlayNavigationContainer () {
    return {
        templateUrl: "../parlay_components/navigation/directives/parlay-navigation-container.html",
        controller: "ParlayNavigationContainerController",
        controllerAs: "ctrl"
    };
}

angular.module("parlay.navigation.container", ["ngMaterial", "parlay.navigation.sidenav"])
    .controller("ParlayNavigationContainerController", ["$mdSidenav", ParlayNavigationContainerController])
    .directive("parlayNavigationContainer", [ParlayNavigationContainer]);