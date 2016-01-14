function ParlayEndpointManagerFactory(PromenadeBroker, ParlayProtocolManager, ParlayStore, $window) {

    // Endpoints currently active in the workspace.
    var active_endpoints = [];

    function ParlayEndpointManager() {
        // Add event handler before window unload to autosave endpoints.
        $window.onbeforeunload = ParlayEndpointManager.prototype.autoSave.bind(this);
    }
    
    /**
	 * Returns Object of active endpoint containers
	 * @returns {Object} key: order, value: active endpoint containers
	 */
    ParlayEndpointManager.prototype.getActiveEndpoints = function () {
	    return active_endpoints;
    };
    
    /**
	 * Checks if we currently have active endpoints.
	 * @returns {Boolean} true if we have endpoints, false otherwise.
	 */
    ParlayEndpointManager.prototype.hasActiveEndpoints = function () {
	    return this.getActiveEndpointCount() > 0;
    };
    
    /**
	 * Returns the number of endpoints currently active.
	 * @returns {Number} endpoint count
	 */
    ParlayEndpointManager.prototype.getActiveEndpointCount = function () {
	    return this.getActiveEndpoints().length;
    };
    
    /**
	 * Clears reference to active endpoint object.
	 */
    ParlayEndpointManager.prototype.clearActiveEndpoints = function () {
	    active_endpoints = [];
    };
    
    /**
	 * Returns the available endpoints from all connected protocols.
	 * @returns {Array} - Endpoints available on all protocols
	 */
    ParlayEndpointManager.prototype.getAvailableEndpoints = function () {
        return ParlayProtocolManager.getOpenProtocols().reduce(function (previous, current) {
            return previous.concat(current.getAvailableEndpoints());
        }, []);
    };
    
    /**
	 * Check whether any discovery request has been made.
	 * @returns {Boolean} - True if we have successfully completed a discovery, false otherwise.
	 */
    ParlayEndpointManager.prototype.hasDiscovered = function () {
	    return PromenadeBroker.getLastDiscovery() !== undefined;
    };
    
    /**
	 * Requests discovery from PromenadeBroker.
	 * @returns {$q.defer.promise} - Resolved when a response is received from the Broker.
	 */
    ParlayEndpointManager.prototype.requestDiscovery = function () {
        return PromenadeBroker.requestDiscovery(true);
    };
    
    /**
	 * Swaps the endpoint at the specified index with the endpoint at index + distance.
	 * @param {Number} index - position of endpoint to swap.
	 * @param {Number} distance - How far to move target endpoint.
	 */
    ParlayEndpointManager.prototype.reorder = function (index, distance) {
	    var temp = active_endpoints[index + distance];
	    active_endpoints[index + distance] = active_endpoints[index];
	    active_endpoints[index] = temp;
    };
    
    /**
	 * Activates endpoint. 
	 * @param {ParlayEndpoint} endpoint - Reference to the endpoint object we want to activate.
	 * @param {Number} uid[optional] - If given a uid we will use the provided one. Otherwise we will randomly generate one.
	 */
    ParlayEndpointManager.prototype.activateEndpoint = function (endpoint, uid) {
	    active_endpoints.push({
		    ref: endpoint,
		    uid: uid !== undefined ? uid : Math.floor(Math.random() * 1500)
	    });
    };
    
    /**
	 * Creates a duplicate endpoint container that references the same endpoint available at the given index.
	 * @param {Number} index - Position of the endpoint we want to duplicate.
	 */
    ParlayEndpointManager.prototype.duplicateEndpoint = function (index) {
	    var container = active_endpoints[index];
	    var new_uid = container.uid + Math.floor(Math.random() * 1500);
	    
	    var old_directive = 'parlayEndpointCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;
	    var new_directive = 'parlayEndpointCard.' + container.ref.name.replace(' ', '_') + '_' + new_uid;
	    
		// We should remove and Angular $ or $$ variables since they are generated.
		var session_data = ParlayStore("endpoints").getSessionItem(old_directive);
		for (var key in session_data) {
			if (key.indexOf('$') !== -1) {
				delete session_data[key];
			}
		}
	    
	    ParlayStore("endpoints").setSessionItem(new_directive, session_data);
	    this.activateEndpoint(container.ref, new_uid);
    };
    
    /**
	 * Deactivates an endoint that is currently active.
	 * @param {Number} index - Position of endpoint to be deactivated.
	 */
    ParlayEndpointManager.prototype.deactivateEndpoint = function (index) {
	    active_endpoints.splice(index, 1);
    };
    
    /**
	 * Loads endpoints from the specified workspace.
	 * @param {Workspace} workspace - Saved workspace to be loaded.
	 */
	ParlayEndpointManager.prototype.loadWorkspace = function (workspace) {
		
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
			var endpoint = this.getAvailableEndpoints().find(function (endpoint) {
				return container.name === endpoint.name;
			});
			if (endpoint !== undefined) {
				loaded_endpoints = true;
				this.activateEndpoint(endpoint, container.uid);
			}
		}, this);
		
		return loaded_endpoints;
		
	};

    /**
     * Saves active endpoints to a workspace titled AutoSave automatically.
     */
	ParlayEndpointManager.prototype.autoSave = function() {
		if (this.hasActiveEndpoints()) {
            ParlayStore("endpoints").moveItemToLocal('AutoSave', true);
        }
	};

	return new ParlayEndpointManager();
}

angular.module('parlay.endpoints.manager', ['parlay.protocols.manager', 'promenade.broker', 'parlay.store', 'parlay.endpoints.workspaces'])
	.factory('ParlayEndpointManager', ['PromenadeBroker', 'ParlayProtocolManager', 'ParlayStore', '$window', ParlayEndpointManagerFactory]);