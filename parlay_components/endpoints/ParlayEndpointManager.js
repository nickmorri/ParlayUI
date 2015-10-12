function ParlayEndpointManager(PromenadeBroker, ParlayProtocolManager, ParlayNotification, ParlayStore, $window) {
    
    var store = ParlayStore("endpoints");
    
    var Private = {
	    has_discovered: false,
	    active_endpoints: []
    };
    
    var Public = {};
    
    /**
	 * Returns Object of active endpoint containers
	 * @returns {Object} key: order, value: active endpoint containers
	 */
    Public.getActiveEndpoints = function () {
        return Private.active_endpoints;
    };
    
    /**
	 * Checks if we currently have active endpoints.
	 * @returns {Boolean} true if we have endpoints, false otherwise.
	 */
    Public.hasActiveEndpoints = function () {
	    return Public.getActiveEndpointCount() > 0;
    };
    
    /**
	 * Returns the number of endpoints currently active.
	 * @returns {Number} endpoint count
	 */
    Public.getActiveEndpointCount = function () {
	    return Public.getActiveEndpoints().length;
    };
    
    /**
	 * Clears reference to active endpoint object.
	 */
    Public.clearActiveEndpoints = function () {
	    Private.active_endpoints = [];
    };
    
    /**
	 * Returns the available endpoints from all connected protocols.
	 * @returns {Array} endpoints available on all protocols
	 */
    Public.getAvailableEndpoints = function () {
        return ParlayProtocolManager.getOpenProtocols().reduce(function (previous, current) {
            return previous.concat(current.getAvailableEndpoints());
        }, []);
    };
    
    /**
	 * Check whether any discovery request has been made.
	 * @returns {Boolean} - True if we have successfully completed a discovery, false otherwise.
	 */
    Public.hasDiscovered = function () {
	    return Private.has_discovered;
    };
    
    /**
	 * Requests discovery from PromenadeBroker.
	 * @returns {$q.defer.promise} Resolved when a response is received from the Broker.
	 */
    Public.requestDiscovery = function () {
        return PromenadeBroker.requestDiscovery(true).then(function(response) {
	        Private.has_discovered = true;
	        return response;
        });
    };
    
    /**
	 * Swaps the endpoint at the specified index with the endpoint at index + distance.
	 * @param {Number} index - position of endpoint to swap.
	 * @param {Number} distance - how far to move target endpoint.
	 */
    Public.reorder = function (index, distance) {
	    var temp = Private.active_endpoints[index + distance];
	    Private.active_endpoints[index + distance] = Private.active_endpoints[index];
	    Private.active_endpoints[index] = temp;
    };
    
    /**
	 * Activates endpoint. 
	 * @param {ParlayEndpoint} endpoint - reference to the endpoint object we want to activate.
	 * @param {Number} uid[optional] - If given a uid we will use the provided one. Otherwise we will randomly generate one.
	 */
    Public.activateEndpoint = function (endpoint, uid) {
	    Private.active_endpoints.push({
		    ref: endpoint,
		    uid: uid !== undefined ? uid : Math.floor(Math.random() * 1500)
	    });
    };
    
    /**
	 * Creates a duplicate endpoint container that references the same endpoint available at the given index.
	 * @param {Number} index - position of the endpoint we want to duplicate.
	 */
    Public.duplicateEndpoint = function (index) {
	    var container = Private.active_endpoints[index];
	    var new_uid = container.uid + Math.floor(Math.random() * 1500);
	    
	    var old_directive = 'parlayEndpointCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;
	    var new_directive = 'parlayEndpointCard.' + container.ref.name.replace(' ', '_') + '_' + new_uid;
	    
		// We should remove and Angular $ or $$ variables since they are generated.
		var session_data = store.getSessionItem(old_directive);
		for (var key in session_data) {
			if (key.indexOf('$') !== -1) {
				delete session_data[key];
			}
		}
	    
	    store.setSessionItem(new_directive, session_data);
	    Public.activateEndpoint(container.ref, new_uid);
    };
    
    /**
	 * Deactivates an endoint that is currently active.
	 * @param {Number} index - position of endpoint to be deactivated.
	 */
    Public.deactivateEndpoint = function (index) {
	    Private.active_endpoints.splice(index, 1);
    };
    
    /**
	 * Loads endpoints from the specified workspace.
	 * @param {Workspace} workspace - saved workspace to be loaded.
	 */
	Public.loadWorkspace = function (workspace) {
		
		// Sort by the $index recorded from the previous session. This corresponds with the order that the cards will be loaded into the workspace.
		var containers = Object.keys(workspace.data).sort(function (a, b) {
			return workspace.data[a].$index > workspace.data[b].$index;
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
			}
		});
		
		ParlayNotification.show({content: loaded_endpoints ? 
			'Restored workspace from ' + workspace.name + '.' : 
			'Unable to restore workspace from ' + workspace.name + '. Ensure endpoints have been discovered.'});
		
	};
	
	Public.autoSave = function() {
		if (Public.hasActiveEndpoints()) ParlayStore("endpoints").moveItemToLocal('AutoSave', true);
	};
	
	$window.onbeforeunload = Public.autoSave;
	
	return Public;
}

angular.module('parlay.endpoints.manager', ['parlay.protocols.manager', 'promenade.broker', 'parlay.store', 'parlay.endpoints.workspaces'])
	.factory('ParlayEndpointManager', ['PromenadeBroker', 'ParlayProtocolManager', 'ParlayNotification', 'ParlayStore', '$window', ParlayEndpointManager]);