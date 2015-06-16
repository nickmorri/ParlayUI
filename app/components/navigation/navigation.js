var navigation = angular.module('parlay.navigation', [])

navigation.directive('parlayToolbar', function () {
    return {
        templateUrl: 'directives/parlay-toolbar.html',
        controller: [function () {
            
        }]
    }
});

navigation.directive('parlayNav', function () {
    return {
        templateUrl: 'directives/parlay-navigation.html',
        controller: ['$scope', function ($scope) {
            
        }]
    }
});