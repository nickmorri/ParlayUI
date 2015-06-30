var parlay_console = angular.module('parlay.console', ['ui.router', 'templates-main']);

/* istanbul ignore next */
parlay_console.config(function ($stateProvider) {
    $stateProvider.state('console', {
        url: '/console',
        templateUrl: '../parlay_components/console/views/base.html',
        controller: 'consoleController'
    });
});

parlay_console.controller('consoleCtrl', function () {
    
});