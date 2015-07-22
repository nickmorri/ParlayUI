var direct_message = angular.module('parlay.endpoints.directmessage', ['parlay.endpoints']);

direct_message.factory('ParlayDirectMessageEndpoint', ['ParlayEndpoint', function (ParlayEndpoint) {
    
    function ParlayDirectMessageEndpoint(data, protocol) {
        ParlayEndpoint.call(this, data, protocol);
        
        this.type = 'DirectMessageEndpoint';
        this.commands = data.commands;
        this.id = data.id;
        
        this.directives = {
            'toolbar': ['bitEndpointToolbar'],
            'tabs': ['bitEndpointCardCommands', 'bitEndpointCardLog']
        };
        
        this.commands = [];        
    }
    
    ParlayDirectMessageEndpoint.prototype = Object.create(ParlayEndpoint.prototype);
    
    ParlayDirectMessageEndpoint.prototype.getCommands = function () {
        return this.commands;
    };
    
    ParlayDirectMessageEndpoint.prototype.getId = function () {
        return this.id;
    };
    
    ParlayDirectMessageEndpoint.prototype.getSystemId = function () {
        return this.getId() >> 8;
    };
    
    ParlayDirectMessageEndpoint.prototype.getDeviceId = function () {
        return this.getId() & 0xff;
    };
    
    ParlayDirectMessageEndpoint.prototype.matchesType = function (query) {
        return angular.lowercase(this.getType()).indexOf(query) > -1;
    };
    
    ParlayDirectMessageEndpoint.prototype.matchesId = function (query) {
        return this.getId() === query;
    };
    
    ParlayDirectMessageEndpoint.prototype.matchesQuery = function (query) {
        return this.matchesType(query) || this.matchesId(query) || this.matchesName(query);
    };
    
    ParlayDirectMessageEndpoint.prototype.matchesName = function (query) {
        return angular.lowercase(this.getName()).indexOf(query) > -1;
    };
    
    ParlayDirectMessageEndpoint.prototype.getMessageId = function () {
        return this.protocol.getMessageId();
    };
    
    ParlayDirectMessageEndpoint.prototype.getFilteredLog = function () {
        return this.protocol.getLog().filter(function (message) {
            return message.topics.from === this.getId();
        }, this);
    };

    return ParlayDirectMessageEndpoint;
        
}]);