function ParlayNavigationContainerController($mdSidenav) {

    this.toggleSidenav = function () {
        $mdSidenav("navigation").toggle();
    };

}

function ParlayNavigationContainer () {
    return {
        templateUrl: "../parlay_components/navigation/directives/parlay-navigation-container.html",
        controller: "ParlayNavigationContainerController",
        controllerAs: "ctrl"
    };
}

angular.module("parlay.navigation.container", ["parlay.navigation.sidenav"])
    .controller("ParlayNavigationContainerController", ["$mdSidenav", ParlayNavigationContainerController])
    .directive("parlayNavigationContainer", [ParlayNavigationContainer]);