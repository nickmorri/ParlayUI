(function () {
    "use strict";

    var module_dependencies = ["ui.router", "ngMaterial", "parlay.items", "parlay.widget", "parlay.navigation.container", "parlay.notification.sidenav"];

    angular
        .module("parlay.main", module_dependencies)
        .config(ParlayConfig);

    ParlayConfig.$inject = ["$urlRouterProvider", "$mdThemingProvider"];
    function ParlayConfig ($urlRouterProvider, $mdThemingProvider) {

        // Theme configuration.
        $mdThemingProvider.theme("default").primaryPalette("blue-grey").accentPalette("red");

        // Needed for warning toast.
        $mdThemingProvider.theme("warning-toast").primaryPalette("amber");

        // Default state for unmatched URLs.
        $urlRouterProvider.otherwise("/items");

    }

}());