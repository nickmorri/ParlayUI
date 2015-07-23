var bit_endpoints = angular.module('bit.endpoints', ['promenade.endpoints.directmessage']);

bit_endpoints.factory('BIT_ServiceEndpoint', ['PromenadeDirectMessageEndpoint', function (PromenadeDirectMessageEndpoint) {
    
    function BIT_ServiceEndpoint(data, protocol) {
        PromenadeDirectMessageEndpoint.call(this, data, protocol);

        this.type = 'BIT_ServiceEndpoint';
        
        this.directives.tabs.push('bitEndpointCardCommands');
        
    }
    
    BIT_ServiceEndpoint.prototype = Object.create(PromenadeDirectMessageEndpoint.prototype);
    
    return BIT_ServiceEndpoint;
}]);