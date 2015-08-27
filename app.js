var parlay = angular.module('parlay.main', ['ui.router', 'parlay.navigation', 'parlay.endpoints']);

parlay.config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {
        
    // Theme configuration
    $mdThemingProvider.theme('default').primaryPalette('blue-grey').accentPalette('red');
    
    // Default state for unmatched URLs
    $urlRouterProvider.otherwise('/endpoints');
    
});