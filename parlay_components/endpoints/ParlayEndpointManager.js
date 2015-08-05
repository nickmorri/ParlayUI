var endpoint_manager = angular.module('parlay.endpoints.manager', ['parlay.protocols', 'promenade.broker']);

endpoint_manager.factory('ParlayEndpointManager', ['PromenadeBroker', 'ProtocolManager', function (PromenadeBroker, ProtocolManager) {
    
    var Private = {
	    active_endpoints: {}
    };
    
    var Public = {};
    
    Public.getActiveEndpoints = function () {
        return Private.active_endpoints;
    };
    
    Public.getAvailableEndpoints = function () {
        return ProtocolManager.getOpenProtocols().reduce(function (previous, current) {
            return previous.concat(current.getAvailableEndpoints());
        }, []);
    };
    
    Public.requestDiscovery = function () {
        return PromenadeBroker.requestDiscovery(true);
    };
    
    Public.reorder = function (index, distance) {
	    var temp = Private.active_endpoints[index + distance];
	    Private.active_endpoints[index + distance] = Private.active_endpoints[index];
	    Private.active_endpoints[index] = temp;
    };
    
    Public.activateEndpoint = function (endpoint) {
	    var count = 0;
	    while (Private.active_endpoints.hasOwnProperty(count)) count++;
	    Private.active_endpoints[count] = {
		    ref: endpoint,
		    uid: Math.floor(Math.random() * 1500)
	    };
    };
    
    Private.compactActiveEndpoints = function () {
	    var keys = Object.keys(Private.active_endpoints);
	    for (var i = 0; i < keys.length; i++) {
		    Private.active_endpoints[i] = Private.active_endpoints[keys[i]];
	    }
	    for (i = keys.length; i < Object.keys(Private.active_endpoints).length; i++) {
		    delete Private.active_endpoints[i];
	    }
    };
    
    Public.duplicateEndpoint = function (index) {
	    Public.activateEndpoint(Private.active_endpoints[index].ref);
    };
    
    Public.deactivateEndpoint = function (index) {
	    delete Private.active_endpoints[index];
	    Private.compactActiveEndpoints();	    
    };
        
    return Public;
}]);