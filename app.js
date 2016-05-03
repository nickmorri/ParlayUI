(function () {
    "use strict";

    var module_dependencies = ["ui.router", "ngMaterial", "parlay.items", "parlay.navigation.container", "parlay.notification.sidenav"];

    angular
        .module("parlay.main", module_dependencies)
        .config(ParlayConfig);

    ParlayConfig.$inject = ["$urlRouterProvider", "$mdThemingProvider", "$compileProvider"];
    function ParlayConfig ($urlRouterProvider, $mdThemingProvider, $compileProvider) {

        // Theme configuration.
        $mdThemingProvider.theme("default").primaryPalette("blue-grey").accentPalette("red");

        // Needed for warning toast.
        $mdThemingProvider.theme("warning-toast").primaryPalette("amber");

        // Default state for unmatched URLs.
        $urlRouterProvider.otherwise("/items");

        // Disable debug info in distribution for a performance boost.
        // https://docs.angularjs.org/guide/production#disabling-debug-data
        // The debugEnabled variable is replaced automatically by grunt-replace depending on the build environment.
        // If we are in dev debugEnabled will be true, if in dist it will be false.
        $compileProvider.debugInfoEnabled(debugEnabled);

    }

}());