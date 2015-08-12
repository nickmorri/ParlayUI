var endpoint_manager = angular.module('parlay.endpoints.manager', ['parlay.protocols', 'promenade.broker', 'parlay.store']);

endpoint_manager.factory('ParlayEndpointManager', ['PromenadeBroker', 'ProtocolManager', 'ParlayLocalStore', 'ParlayNotification', function (PromenadeBroker, ProtocolManager, ParlayLocalStore, ParlayNotification) {
    
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
    
    Public.activateEndpoint = function (endpoint, uid) {
	    var count = 0;
	    while (Private.active_endpoints.hasOwnProperty(count)) count++;
	    Private.active_endpoints[count] = {
		    ref: endpoint,
		    uid: uid !== undefined ? uid : Math.floor(Math.random() * 1500)
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
    
	Private.loadPreviousWorkspace = function () {
		
		var config = ParlayLocalStore.values();
		
		// Sort by the $index recorded from the previous session. This corresponds with the order that the cards will be loaded into the workspace.
		var containers = Object.keys(config).sort(function (a, b) {
			return config[a].$index > config[b].$index;
		}).map(function (key) {
			var split_name = key.split('.')[1].split('_');
			var uid = parseInt(split_name.splice(split_name.length - 1, 1)[0], 10);
			var endpoint_name = split_name.join(' ');			
			return {
				name: endpoint_name,
				uid: uid
			};
		});
		
		var loaded_endpoints = false;
		
		// Add each saved card to the workspace if their exists a valid available endpoint.
		containers.forEach(function (container) {
			var endpoint = Public.getAvailableEndpoints().find(function (endpoint) {
				return container.name === endpoint.name;
			});
			if (endpoint !== undefined) {
				loaded_endpoints = true;
				Public.activateEndpoint(endpoint, container.uid);
				return true;
			}
			else return false;
		});
		
		if (loaded_endpoints) ParlayNotification.show({
			content: 'Restored workspace from previous session.'
		});
		
	};
	
	PromenadeBroker.onDiscovery(Private.loadPreviousWorkspace);
	
	return Public;
}]);