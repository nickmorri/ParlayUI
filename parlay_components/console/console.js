var parlay_console = angular.module('parlay.console', ['ui.router', 'templates-main']);

/* istanbul ignore next */
parlay_console.config(function ($stateProvider) {
    $stateProvider.state('console', {
        url: '/console',
        templateUrl: '../partials/console.html',
        controller: 'consoleController'
    });
});

parlay_console.controller('consoleCtrl', function () {
    
});