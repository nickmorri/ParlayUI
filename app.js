var parlay = angular.module('parlay.main', ['ui.router', 'parlay.socket', 'parlay.navigation', 'parlay.endpoints', 'parlay.editor', 'parlay.console', 'parlay.settings', 'parlay.help']);

parlay.config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {
    
    // Theme configuration
    $mdThemingProvider.theme('default')
        .accentPalette('red');
    
    // Default state for unmatched URLs
    $urlRouterProvider.otherwise('/endpoints')
    
    // State definitions
    $stateProvider
    .state('endpoints', {
        url: '/endpoints',
        templateUrl: '../partials/endpoints.html',
        controller: 'endpointController'
    })
    .state('editor', {
        url: '/editor',
        templateUrl: '../partials/editor.html',
        controller: 'editorController'
    })
    .state('console', {
        url: '/console',
        templateUrl: '../partials/console.html',
        controller: 'consoleController'
    })
    .state('settings', {
        url: '/settings',
        templateUrl: '../partials/settings.html',
        controller: 'settingsController'
    }).
    state('help', {
        url: '/help',
        templateUrl: '../partials/help.html',
        controller: 'helpController'
    });
    
});