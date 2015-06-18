var devices = angular.module('parlay.devices', []);

devices.factory('DeviceManager', function ($q) {
    var Public = {};
    var Private = {};
    
    Private.device_count = 0;
    
    Public.active_devices = [];
    
    Private.available_devices = [];
    
    Public.setupDevice = function () {
        return $q(function (resolve, reject) {
            Public.active_devices.push({});
            resolve(Private.device_count);
        });
    };
    
    Public.disconnectDevice = function (index) {
        return $q(function (resolve, reject) {
            
            resolve(Public.active_devices.splice(index, 1));
        });
    };
    
    return Public;
});

devices.controller('deviceCtrl', function ($scope, $mdToast, DeviceManager) {
    
    $scope.deviceManager = DeviceManager;
    
    // Toast alert position configuration
    $scope.toastPosition = {
        bottom: true,
        left: true,
        top: false,
        right: false
    };
    
    // Default to display device/endpoint cards
    $scope.displayCards = true;
    
    // Retrieves toast position
    $scope.getToastPosition = function() {
        return Object.keys($scope.toastPosition).filter(function(pos) { return $scope.toastPosition[pos]; }).join(' ');
    };
    
    // Do endpoint/device setup
    $scope.setupDevice = function () {
        $scope.deviceManager.setupDevice();
    };
    
    // Reconnect device if we become disconnected and user requests reconnection
    $scope.reconnectDevice = function (result) {
        $scope.setupDevice();
    };
    
    // Disconnect device when user asks
    $scope.disconnectDevice = function (index) {
        $scope.deviceManager.disconnectDevice(index).then(function () {
            
            // Display toast alert notifying user of lost connection
            $mdToast.show($mdToast.simple()
                .content('Disconnected ' + index + ' device!')
                .action('Reconnect')
                .position($scope.getToastPosition()).hideDelay(3000)).then($scope.reconnectDevice);
        });        
    };    
    
});

devices.directive('parlayDeviceCardItem', function () {
    return {
        templateUrl: 'components/devices/directives/parlay-device-card-item.html'
    }
});

devices.directive('parlayDeviceListItem', function () {
    return {
        templateUrl: 'components/devices/directives/parlay-device-list-item.html'
    }
});

devices.directive('parlayDevicesToolbar', function () {
    return {
        templateUrl: 'components/devices/directives/parlay-devices-toolbar.html'
    }
});