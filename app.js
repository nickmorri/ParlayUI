function ParlayConfig($stateProvider, $urlRouterProvider, $mdThemingProvider) {
        
    // Theme configuration
    $mdThemingProvider.theme('default').primaryPalette('blue-grey').accentPalette('red');
    
    // Default state for unmatched URLs
    $urlRouterProvider.otherwise('/endpoints');
    
}

angular.module('parlay.main', ['ui.router', 'parlay.navigation', 'parlay.endpoints'])
	.config(ParlayConfig);