var endpoints = angular.module('parlay.endpoints', ['ui.router', 'ngMaterial', 'ngMdIcons', 'parlay.socket', 'templates-main']);

/* istanbul ignore next */
endpoints.config(function($stateProvider) {

    $stateProvider.state('endpoints', {
        url: '/endpoints',
        templateUrl: '../parlay_components/endpoints/views/base.html',
        controller: 'endpointController'
    });
});

endpoints.factory('parlayEndpoint', function () {
    var Public = {};
    var Private = {};
    
    return Public;
});

endpoints.factory('EndpointManager', ['$q', 'parlayEndpoint', 'ParlaySocket', function ($q, parlayEndpoint, ParlaySocket) {
    var Public = {};
    var Private = {
        socket: ParlaySocket({
            url: 'ws://' + location.hostname + ':8085'
        })
    };
    
    Private.generateEndpoints = function() {
      return [
        {
          'name': 'Stepper',
          'type': 'Motor'
        },
        {
          'name': 'Universal',
          'type': 'Motor'
        },
        {
          'name': 'AC',
          'type': 'Power Supply'
        },
        {
          'name': 'DC',
          'type': 'Power Supply'
        },
        {
            'name': 'NAV',
            'type': 'Avionics'
        },
        {
            'name': 'Rotor',
            'type': 'Medical'
        }
      ].map(function (end) {
        end._lowername = end.name.toLowerCase();
        end._lowertype = end.type.toLowerCase();
        return end;
      });
    };
    
    Public.active_endpoints = [];
    
    Public.available_endpoints = Private.generateEndpoints();
    
    Public.setupEndpoint = function () {
        return $q(function (resolve, reject) {
            Public.active_endpoints.push(Public.available_endpoints.pop());
            resolve(Public.active_endpoints.length);
        });
    };
    
    Public.disconnectEndpoint = function (index) {
        return $q(function (resolve, reject) {
            resolve(Public.active_endpoints.splice(index, 1)[0]);
        });
    };
    
    Public.reconnectEndpoint = function(endpoint) {
        return $q(function (resolve, reject) {
            Public.active_endpoints.push(endpoint);
            resolve(endpoint);
        });
    };
        
    return Public;
}]);

endpoints.controller('endpointController', ['$scope', '$mdToast', 'EndpointManager', function ($scope, $mdToast, EndpointManager) {
    $scope.endpointManager = EndpointManager;
    
    $scope.searching = false;
    $scope.search_icon = 'search';
    $scope.toggleSearch = function () {
        $scope.searching = !$scope.searching;
        if (!$scope.searching) {
            $scope.searchText = null;
            $scope.search_icon = 'search';
        }
        else {
            $scope.search_icon = 'close';
        }
    };
    $scope.selectedItem = null;

    /**
     * Search for endpoints.
     */
    $scope.querySearch = function(query) {
      return query ? $scope.endpointManager.active_endpoints.filter($scope.createFilterFor(query)) : $scope.endpoints;
    };

    /**
     * Create filter function for a query string
     */
    $scope.createFilterFor = function(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(endpoint) {
        return (endpoint._lowername.indexOf(lowercaseQuery) === 0) ||
            (endpoint._lowertype.indexOf(lowercaseQuery) === 0);
      };

    };
    
    // Default to display endpoint cards
    $scope.displayCards = true;
    $scope.display_icon = 'now_widgets';
    
    $scope.$watch('displayCards', function (previous, current) {
        if (previous) $scope.display_icon = 'now_widgets';
        else $scope.display_icon = 'list';
    });
    
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
        $scope.endpointManager.disconnectEndpoint(index).then(function (endpoint) {
            // Display toast alert notifying user of lost connection
            $mdToast.show($mdToast.simple()
                .content('Disconnected ' + endpoint.name)
                .action('Reconnect').highlightAction(true)
                .position('bottom left').hideDelay(3000)).then(function () {
                    $scope.reconnectEndpoint(endpoint);
                });
        });        
    };
    
}]);

/* istanbul ignore next */
endpoints.directive('parlayEndpointCardItem', function () {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-card-item.html'
    };
});

/* istanbul ignore next */
endpoints.directive('parlayEndpointListItem', function () {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoint-list-item.html'
    };
});

/* istanbul ignore next */
endpoints.directive('parlayEndpointsToolbar', function () {
    return {
        templateUrl: '../parlay_components/endpoints/directives/parlay-endpoints-toolbar.html'
    };
});