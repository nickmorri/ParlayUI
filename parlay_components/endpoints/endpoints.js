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
    
    Private.socket.onMessage({'type': 'motor'}, function (message) {
        //
    });
    
    Private.socket.onMessage({'type': 'wheel'}, function (message) {
        //
    });
     
    Private.socket.sendMessage({'type': 'motor'}, {data: []});
    Private.socket.sendMessage({'type': 'arm'}, {data: []});
    Private.socket.sendMessage({'type': 'wheel'}, {data: []});
    Private.socket.sendMessage({'type': 'engine'}, {data: []}, function (message) {
        //
    });
    
    Private.socket.sendMessage({'topics': {'type': 'broker', 'request':'get_protocols'}, 'contents': {}});
    
    Private.socket.onOpen(function () {
        Public.active_endpoints.push({});
    });
    
    return Public;
}]);

endpoints.controller('endpointController', ['$scope', '$mdToast', 'EndpointManager', function ($scope, $mdToast, EndpointManager) {
    $scope.endpointManager = EndpointManager;
    
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
                .action('Reconnect').highlightAction(true)
                .position('bottom left').hideDelay(3000)).then($scope.reconnectEndpoint);
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