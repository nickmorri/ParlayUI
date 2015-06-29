var settings = angular.module('parlay.settings', ['ui.router', 'templates-main']);

/* istanbul ignore next */
settings.config(function ($stateProvider) {
    $stateProvider.state('settings', {
        url: '/settings',
        templateUrl: '../partials/settings.html',
        controller: 'settingsController'
    });
});

settings.controller('settingsCtrl', function () {});