var parlay = angular.module('parlay.main', ['ngAnimate','ui.router', 'parlay.socket', 'parlay.navigation', 'parlay.endpoints']);

parlay.config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {
        
    // Theme configuration
    $mdThemingProvider.theme('default').primaryPalette('green').accentPalette('red');
    
    // Default state for unmatched URLs
    $urlRouterProvider.otherwise('/endpoints');
    
});