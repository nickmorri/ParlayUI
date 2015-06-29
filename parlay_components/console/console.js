var console = angular.module('parlay.console', ['ui.router', 'templates-main']);

/* istanbul ignore next */
console.config(function ($stateProvider) {
    $stateProvider.state('console', {
        url: '/console',
        templateUrl: '../partials/console.html',
        controller: 'consoleController'
    });
});

console.controller('consoleCtrl', function () {
    
});