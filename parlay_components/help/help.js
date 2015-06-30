var help = angular.module('parlay.help', ['ui.router', 'templates-main']);

/* istanbul ignore next */
help.config(function ($stateProvider) {
    $stateProvider.state('help', {
        url: '/help',
        templateUrl: '../parlay_components/help/views/base.html',
        controller: 'helpController'
    });
});

help.controller('helpCtrl', function () {});