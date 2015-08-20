var detail_controller = angular.module('parlay.protocols.detail_controller', ['ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main']);

detail_controller.controller('ParlayProtocolConnectionDetailController', ['$scope', '$mdDialog', 'protocol', function ($scope, $mdDialog, protocol) {
    $scope.getProtocolName = function () {
        return protocol.getName();
    };
    
    $scope.getLog = function () {
        return protocol.getLog();
    };
    
    $scope.hide = $mdDialog.hide;
    
}]);