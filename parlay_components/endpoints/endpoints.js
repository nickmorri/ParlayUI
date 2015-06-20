var endpoints = angular.module('parlay.endpoints', ['ngMaterial', 'ngMdIcons', 'parlay.socket']);

endpoints.factory('parlayEndpoint', function () {
    var Public = {};
    var Private = {};
    
    return Public;
});

endpoints.factory('EndpointManager', ['$q', 'parlayEndpoint', 'ParlaySocket', function ($q, parlayEndpoint, ParlaySocket) {
    var Public = {};
    var Private = {
        socket: ParlaySocket
    };
    
    Public.active_endpoints = [];
    
    Public.setupEndpoint = function () {
        return $q(function (resolve, reject) {
            Public.active_endpoints.push({});
            resolve(Public.active_endpoints.length);
        });
    };
    
    Public.disconnectEndpoint = function (index) {
        return $q(function (resolve, reject) {
            resolve(Public.active_endpoints.splice(index, 1));
        });
    };
    
    Public.reconnectEndpoint = function(index) {
        return $q(function (resolve, reject) {
            Public.active_endpoints.push({});
            resolve(Public.active_endpoints.length);
        });
    };
    
    Private.socket.onMessage(['motor', 'arm'], function (message) {
        //
    });
    
    Private.socket.onMessage({
        'motor': function (message) {
            //
        },
        'arm': function (message) {
            //
        }
    });
    
    Private.socket.onMessage('wheel', function (message) {
        //
    });
     
    Private.socket.sendMessage('motor', {data: []});
    Private.socket.sendMessage('arm', {data: []});
    Private.socket.sendMessage('wheel', {data: []});
    Private.socket.sendMessage('engine', {data: []}, function (message) {
        //
    });
    
    
    
    return Public;
}]);

endpoints.controller('endpointController', ['$scope', '$mdToast', 'EndpointManager', function ($scope, $mdToast, EndpointManager) {
    $scope.endpointManager = EndpointManager;
    
    // Toast alert position configuration
    $scope.toastPosition = {
        bottom: true,
        left: true,
        top: false,
        right: false
    };

    // Retrieves toast position
    $scope.getToastPosition = function() {
        return Object.keys($scope.toastPosition).filter(function(pos) { return $scope.toastPosition[pos]; }).join(' ');
    };
    
    $scope.isSearching = false;
    
    $scope.toggleSearch = function () {
        $scope.isSearching = !$scope.isSearching;
    };
    
    // Default to display endpoint cards
    $scope.displayCards = true;
    
    // Do endpoint setup
    $scope.setupEndpoint = function () {
        $scope.endpointManager.setupEndpoint();
    };
    
    // Reconnect endpoint if we become disconnected and user requests reconnection
    $scope.reconnectEndpoint = function (index) {
        $scope.endpointManager.reconnectEndpoint(index);
    };
    
    // Disconnect endpoint when user asks
    $scope.disconnectEndpoint = function (index) {
        $scope.endpointManager.disconnectEndpoint(index).then(function () {
            
            // Display toast alert notifying user of lost connection
            $mdToast.show($mdToast.simple()
                .content('Disconnected ' + index + ' endpoint!')
                .action('Reconnect')
                .highlightAction(true)
                .position($scope.getToastPosition()).hideDelay(3000)).then($scope.reconnectEndpoint);
        });        
    };    
    
}]);

endpoints.directive('parlayEndpointCardItem', function () {
    return {
        templateUrl: 'parlay_components/endpoints/directives/parlay-endpoint-card-item.html'
    };
});

endpoints.directive('parlayEndpointListItem', function () {
    return {
        templateUrl: 'parlay_components/endpoints/directives/parlay-endpoint-list-item.html'
    };
});

endpoints.directive('parlayEndpointsToolbar', function () {
    return {
        templateUrl: 'parlay_components/endpoints/directives/parlay-endpoints-toolbar.html'
    };
});