(function () {
    "use strict";

    var module_dependencies = ["ui.router", "ngMaterial", "ngSanitize", "vendor.defaults", "parlay.items", "parlay.widget", "parlay.navigation.container", "parlay.notification.sidenav"];

    angular
        .module("parlay.main", module_dependencies)
        .controller("ParlayHeadController", ParlayHeadController)
        .config(ParlayConfig);

    ParlayConfig.$inject = ["$provide", "$urlRouterProvider", "$mdThemingProvider", "$compileProvider", "vendorPalette", "debugEnabled"];
    function ParlayConfig ($provide, $urlRouterProvider, $mdThemingProvider, $compileProvider, vendorPalette, debugEnabled) {

        // Theme configuration.
        $mdThemingProvider.theme("default").primaryPalette(vendorPalette.primary).accentPalette(vendorPalette.accent);

        // Needed for warning toast.
        $mdThemingProvider.theme("warning-toast").primaryPalette("amber");

        // Default state for unmatched URLs.
        $urlRouterProvider.otherwise("/items");

        // Disable debug info in distribution for a performance boost.
        // https://docs.angularjs.org/guide/production#disabling-debug-data
        // The debugEnabled variable is replaced automatically by grunt-replace depending on the build environment.
        // If we are in dev debugEnabled will be true, if in dist it will be false.
        $compileProvider.debugInfoEnabled(debugEnabled);
        // Make the primary theme color available as a value.

        $provide.value("themeColor", $mdThemingProvider._PALETTES[vendorPalette.primary][500]);

    }

    ParlayHeadController.$inject = ["$sce", "vendorIcon", "themeColor"];
    function ParlayHeadController ($sce, vendorIcon, themeColor) {
        this.vendorIcon = $sce.trustAsResourceUrl(vendorIcon);
        this.themeColor = themeColor;
    }

}());
