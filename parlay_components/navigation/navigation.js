var navigation = angular.module('parlay.navigation', ['ui.router', 'ngMaterial', 'ngMdIcons', 'promenade.broker', 'parlay.protocols', 'templates-main']);

navigation.controller('parlayToolbarController', ['$scope', '$state', '$mdSidenav', '$mdMedia', function ($scope, $state, $mdSidenav, $mdMedia) {
    // Allows view to access information from $state object. Using $current.self.name for display in toolbar
    $scope.$state = $state;
}]);

navigation.directive('parlayConnectionStatus', function (PromenadeBroker) {
    return {
        scope: {},
        templateUrl: '../parlay_components/navigation/directives/parlay-connection-status.html',
        controller: 'ParlayConnectionStatusController'
    };
});

/* istanbul ignore next */
navigation.directive('parlayToolbar', function () {
    return {
        templateUrl: '../parlay_components/navigation/directives/parlay-toolbar.html',
        controller: 'parlayToolbarController'
    };
});