var help = angular.module('parlay.help', ['ui.router']);

help.config(function ($stateProvider) {
    $stateProvider.state('help', {
        url: '/help',
        templateUrl: '../partials/help.html',
        controller: 'helpController'
    });
});

help.controller('helpCtrl', function () {});