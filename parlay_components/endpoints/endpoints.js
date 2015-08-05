var endpoints = angular.module('parlay.endpoints', ['ui.router', 'parlay.endpoints.manager', 'parlay.endpoints.search', 'parlay.endpoints.endpoint', 'parlay.endpoints.controller']);

/* istanbul ignore next */
endpoints.config(function($stateProvider) {
    $stateProvider.state('endpoints', {
        url: '/endpoints',
        templateUrl: '../parlay_components/endpoints/views/base.html',
        controller: 'ParlayEndpointController'
    });
});