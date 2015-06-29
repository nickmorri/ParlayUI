var console = angular.module('parlay.console', ['ui.router']);

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