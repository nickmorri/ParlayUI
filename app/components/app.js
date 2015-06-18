var parlay = angular.module('parlay.main', ['ngMaterial', 'ngMdIcons', 'ui.router', 'parlay.navigation', 'parlay.devices', 'parlay.editor', 'parlay.console', 'parlay.settings', 'parlay.help']);

parlay.config(function ($stateProvider, $urlRouterProvider, $mdThemingProvider) {
    
    // Theme configuration
    $mdThemingProvider.theme('default')
        .accentPalette('red');
    
    // Default state for unmatched URLs
    $urlRouterProvider.otherwise('/devices')
    
    // State definitions
    $stateProvider
    .state('devices', {
        url: '/devices',
        templateUrl: '../partials/devices.html',
        controller: 'deviceCtrl'
    })
    .state('editor', {
        url: '/editor',
        templateUrl: '../partials/editor.html',
        controller: 'editorCtrl'
    })
    .state('console', {
        url: '/console',
        templateUrl: '../partials/console.html',
        controller: 'consoleCtrl'
    })
    .state('settings', {
        url: '/settings',
        templateUrl: '../partials/settings.html',
        controller: 'settingsCtrl'
    }).
    state('help', {
        url: '/help',
        templateUrl: '../partials/help.html',
        controller: 'helpCtrl'
    });
    
});