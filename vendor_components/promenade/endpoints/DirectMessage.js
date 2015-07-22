var direct_message_endpoints = angular.module('promenade.endpoints.directmessage', ['parlay.endpoints']);

direct_message_endpoints.factory('PromenadeDirectMessageEndpoint', ['ParlayEndpoint', function (ParlayEndpoint) {
    
    function PromenadeDirectMessageEndpoint(data, protocol) {
        ParlayEndpoint.call(this, data, protocol);
        
        this.type = 'DirectMessageEndpoint';
        this.commands = data.commands;
        this.id = data.id;
        
        this.directives.toolbar.push('promenadeDirectMessageEndpointCardToolbar');
        this.directives.tabs.push('promenadeDirectMessageEndpointCardCommands', 'promenadeDirectMessageEndpointCardLog');
        
        this.commands = [];        
    }
    
    PromenadeDirectMessageEndpoint.prototype = Object.create(ParlayEndpoint.prototype);
    
    PromenadeDirectMessageEndpoint.prototype.getCommands = function () {
        return this.commands;
    };
    
    PromenadeDirectMessageEndpoint.prototype.getId = function () {
        return this.id;
    };
    
    PromenadeDirectMessageEndpoint.prototype.getSystemId = function () {
        return this.getId() >> 8;
    };
    
    PromenadeDirectMessageEndpoint.prototype.getDeviceId = function () {
        return this.getId() & 0xff;
    };
    
    PromenadeDirectMessageEndpoint.prototype.matchesType = function (query) {
        return angular.lowercase(this.getType()).indexOf(query) > -1;
    };
    
    PromenadeDirectMessageEndpoint.prototype.matchesId = function (query) {
        return this.getId() === query;
    };
    
    PromenadeDirectMessageEndpoint.prototype.matchesQuery = function (query) {
        return this.matchesType(query) || this.matchesId(query) || this.matchesName(query);
    };
    
    PromenadeDirectMessageEndpoint.prototype.matchesName = function (query) {
        return angular.lowercase(this.getName()).indexOf(query) > -1;
    };
    
    PromenadeDirectMessageEndpoint.prototype.getMessageId = function () {
        return this.protocol.getMessageId();
    };
    
    PromenadeDirectMessageEndpoint.prototype.getFilteredLog = function () {
        return this.protocol.getLog().filter(function (message) {
            return message.topics.from === this.getId();
        }, this);
    };

    return PromenadeDirectMessageEndpoint;
        
}]);

direct_message_endpoints.controller('PromenadeDirectMessageEndpointCardLogController', ['$scope', function ($scope) {
    
    $scope.getLog = function () {
        return $scope.endpoint.getFilteredLog();
    };
    
}]);

direct_message_endpoints.directive('promenadeDirectMessageEndpointCardToolbar', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-direct-message-endpoint-card-toolbar.html'
    };
});

direct_message_endpoints.directive('promenadeDirectMessageEndpointCardLog', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-direct-message-endpoint-card-log.html',
        controller: 'PromenadeDirectMessageEndpointCardLogController'
    };
});