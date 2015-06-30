var settings = angular.module('parlay.settings', ['ui.router', 'templates-main']);

/* istanbul ignore next */
settings.config(function ($stateProvider) {
    $stateProvider.state('settings', {
        url: '/settings',
        templateUrl: '../parlay_components/settings/views/base.html',
        controller: 'settingsController'
    });
});

settings.controller('settingsCtrl', function () {});