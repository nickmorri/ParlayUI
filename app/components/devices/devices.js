var devices = angular.module('parlay.devices', []);

devices.controller('deviceCtrl', function ($scope, $mdToast) {
    
    $scope.device_count = 0;
    
    $scope.active_devices = [];
    
    $scope.toastPosition = {
        bottom: true,
        left: true,
        top: false,
        right: false
    };
    
    $scope.getToastPosition = function() {
        return Object.keys($scope.toastPosition).filter(function(pos) { return $scope.toastPosition[pos]; }).join(' ');
    };
    
    $scope.setup_device = function () {
        $scope.active_devices.push($scope.device_count++);
    };
    
    $scope.disconnect_device = function (index) {
        $scope.active_devices.splice(index, 1);
        $mdToast.show(
            $mdToast.simple().content('Disconnected ' + index + ' device!').position($scope.getToastPosition()).hideDelay(3000)
        );
        
    };
    
});

devices.directive('parlayDevice', function () {
    return {
        templateUrl: 'components/devices/directives/parlay_device.html'
    }
});