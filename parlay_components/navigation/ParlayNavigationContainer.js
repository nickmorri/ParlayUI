(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.navigation.sidenav", "vendor.defaults"];

    /* istanbul ignore next */
    ParlayNavigationContainerController.$inject = ["$mdSidenav", "vendorLogo", "vendorIcon"];
    function ParlayNavigationContainerController($mdSidenav, vendorLogo, vendorIcon) {

        this.vendorLogo = vendorLogo;
        this.vendorIcon = vendorIcon;

        this.toggleSidenav = function () {
            $mdSidenav("navigation").toggle();
        };

    }

    /* istanbul ignore next */
    ParlayNavigationContainer.$inject = ["themeColor"];
    function ParlayNavigationContainer (themeColor) {
        return {
            templateUrl: "../parlay_components/navigation/directives/parlay-navigation-container.html",
            controller: "ParlayNavigationContainerController",
            controllerAs: "ctrl",
            link: function (scope, element) {
                element.find("md-list")[0].style.backgroundColor = themeColor;
            }
        };
    }

    angular.module("parlay.navigation.container", module_dependencies)
        .controller("ParlayNavigationContainerController", ParlayNavigationContainerController)
        .directive("parlayNavigationContainer", ParlayNavigationContainer);

}());