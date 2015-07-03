var parlay = angular.module('parlay.main', ['ui.router', 'parlay.socket', 'parlay.navigation', 'parlay.endpoints', 'parlay.editor', 'parlay.console', 'parlay.settings', 'parlay.help']);

parlay.config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {
    
    // Theme configuration
    $mdThemingProvider.theme('default').accentPalette('red');
    $mdThemingProvider.theme('docs-dark', 'default').primaryPalette('yellow').dark();
    
    // Default state for unmatched URLs
    $urlRouterProvider.otherwise('/endpoints');
    
});