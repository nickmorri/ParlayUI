var endpoints = angular.module('parlay.endpoints', ['ngMaterial', 'ngMdIcons']);

endpoints.factory('parlayEndpoint', function () {
    var Public = {};
    var Private = {};
    
    return Public;
});

endpoints.factory('EndpointManager', ['$q', 'parlayEndpoint', function ($q, parlayEndpoint) {
    var Public = {};
    var Private = {};
    
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
    }    
    
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
        templateUrl: 'components/endpoints/directives/parlay-endpoint-card-item.html'
    }
});

endpoints.directive('parlayEndpointListItem', function () {
    return {
        templateUrl: 'components/endpoints/directives/parlay-endpoint-list-item.html'
    }
});

endpoints.directive('parlayEndpointsToolbar', function () {
    return {
        templateUrl: 'components/endpoints/directives/parlay-endpoints-toolbar.html'
    }
});