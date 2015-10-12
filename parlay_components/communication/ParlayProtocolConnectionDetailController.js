function ParlayProtocolConnectionDetailController($scope, $mdDialog, protocol) {
    $scope.getProtocolName = function () {
        return protocol.getName();
    };
    
    $scope.getLog = function () {
        return protocol.getLog();
    };
    
    $scope.hide = $mdDialog.hide;
    
}

angular.module('parlay.protocols.detail_controller', ['ngMaterial', 'ngMessages', 'ngMdIcons', 'templates-main', 'luegg.directives'])
	.controller('ParlayProtocolConnectionDetailController', ['$scope', '$mdDialog', 'protocol', ParlayProtocolConnectionDetailController]);