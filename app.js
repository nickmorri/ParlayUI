function ParlayConfig($urlRouterProvider, $mdThemingProvider) {
        
    // Theme configuration.
    $mdThemingProvider.theme("default").primaryPalette("blue-grey").accentPalette("red");

    // Needed for warning toast.
    $mdThemingProvider.theme("warning-toast").primaryPalette("amber");

    // Default state for unmatched URLs.
    $urlRouterProvider.otherwise("/items");
    
}

angular.module("parlay.main", ["ui.router", "ngMaterial", "parlay.items", "parlay.editor", "parlay.navigation.container", "parlay.notification.sidenav"])
	.config(ParlayConfig);