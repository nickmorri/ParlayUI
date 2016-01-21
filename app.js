function ParlayConfig($stateProvider, $urlRouterProvider, $mdThemingProvider) {
        
    // Theme configuration
    $mdThemingProvider.theme("default").primaryPalette("blue-grey").accentPalette("red");

    // Needed for warning toast.
    $mdThemingProvider.theme("warning-toast").primaryPalette("amber");

    // Default state for unmatched URLs
    $urlRouterProvider.otherwise("/items");
    
}

angular.module("parlay.main", ["ui.router", "parlay.items"])
	.config(ParlayConfig);