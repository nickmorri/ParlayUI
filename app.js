(function () {
    "use strict";

    var module_dependencies = ["ui.router", "ngMaterial", "ngSanitize", "vendor.defaults", "parlay.items", "parlay.widget", "parlay.navigation.container", "parlay.notification.sidenav", "parlay.store"];

    angular
        .module("parlay.main", module_dependencies)
        .controller("ParlayHeadController", ParlayHeadController)
        .config(ParlayConfig)
        .run(ParlayRun);

    ParlayConfig.$inject = ["$provide", "$urlRouterProvider", "$mdThemingProvider", "$compileProvider", "vendorPalette",
        "$animateProvider", "debugEnabled"];
    function ParlayConfig ($provide, $urlRouterProvider, $mdThemingProvider, $compileProvider, vendorPalette,
                           $animateProvider, debugEnabled) {

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

        //optimize animations
        //$animateProvider.classNameFilter( /\banimated\b/ );
    }

    ParlayRun.$inject = ["$rootScope", "$state", "ParlayStore"];
    function ParlayRun ($rootScope, $state, ParlayStore) {

        // If the user navigated directly to a route take them there.
        if (window.location.hash === "" && ParlayStore("route").has("last")) {
            var last_state = ParlayStore("route").get("last");
            if ($state.get(last_state) !== null) {
                $state.go(last_state);
            }
        }

        // Record the last state the user navigated to.
        $rootScope.$on("$stateChangeSuccess", function (event, toState) {
            ParlayStore("route").set("last", toState.name);
        });

        //check the minimum requirements
        var min_reqs = [Modernizr.cookies, Modernizr.canvas, Modernizr.json,
            Modernizr.unicode, Modernizr.websockets,Modernizr.flexbox,Modernizr.blobconstructor,Modernizr.webworkers,Modernizr.localstorage];
        var alerted = false;
        for(var i=0; i< min_reqs.length; i++)
        {
            if(!min_reqs[i]) {
                if(!alerted) alert("Warning: Your browser does not support the minimum requirements for Parlay. Please upgrade to the latest version of Chrome or Fireforx");
                alerted = true;
                console.log(i + " - UNSUPPORTED");
            }

        }



    }

    ParlayHeadController.$inject = ["$sce", "vendorIcon", "themeColor"];
    function ParlayHeadController ($sce, vendorIcon, themeColor) {
        this.vendorIcon = $sce.trustAsResourceUrl(vendorIcon);
        this.themeColor = themeColor;
    }

}());
