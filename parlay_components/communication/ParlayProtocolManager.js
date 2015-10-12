function ParlayProtocolManager($injector, $q, PromenadeBroker, ParlayStore, ParlayNotification) {
    
    var store = ParlayStore("protocols");
    
    var Private = {
        open_protocols: [],
        available_protocols: [],
        saved_protocols: []
    };
    
    var Public = {};
    
    /**
     * Public Methods
     */
    
    /**
     * Returns cached available protocols.
     * @returns {Array} - available protocols.
     */
    Public.getAvailableProtocols = function () {
        return Private.available_protocols;
    };
    
    /**
     * Returns cached open protocols.
     * @returns {Array} - open protocols.
     */
    Public.getOpenProtocols = function () {
        return Private.open_protocols;
    };
    
    /**
	 * Returns saved protocol configurations that are available and not currently connected.
	 * @returns {Array} - Array of protocol configurations.
	 */
    Public.getSavedProtocols = function () {
	    return Private.saved_protocols;
    };
    
    /**
	 * Save the protocol configuration in the ParlayStore.
	 * @param {Object} configuration - Protocol configuration that can be sent to the Broker.
	 */
    Private.saveProtocolConfiguration = function (configuration) {
	    var saved_protocols = store.getLocalItem("saved");
	    if (saved_protocols === undefined) saved_protocols = {};
	    
	    configuration.last_connected = new Date();
	    
	    saved_protocols[configuration.name] = configuration;
	    
	    store.setLocalItem("saved", saved_protocols);
	    Private.setSavedProtocols();
    };
    
    /**
	 * Delete the protocol configuration in the ParlayStore.
	 * @param {Object} configuration - Protocol configuration that we are removing from the ParlayStore.
	 */
    Public.deleteProtocolConfiguration = function (configuration) {
		var saved_protocols = store.getLocalItem("saved");
		if (saved_protocols === undefined) return;
		
		delete saved_protocols[configuration.name];
			
		store.setLocalItem("saved", saved_protocols);
		Private.setSavedProtocols();
    };
    
    /**
     * Requests the Broker to open a protocol. 
     * Saves the configuration in ParlayStore for later ease of use.
     * @param {Object} configuration - Contains protocol configuration parameters.
     * @returns {$q.defer.promise} - Resolved when the Broker responds with the open result.
     */
    Public.openProtocol = function (configuration) {
	    return PromenadeBroker.openProtocol(configuration).then(function (response) {
		    Private.saveProtocolConfiguration(configuration);
	        /* istanbul ignore next */
            ParlayNotification.show({
                content: 'Connected to ' + response.name + '.',
                action: {
                    text: 'Discover',
                    callback: function () {
                        Public.requestDiscovery(true);
                    }
                }
            });
            return response;
        }).catch(function (status) {
	        ParlayNotification.show({content: status});
	        return $q.reject(status);
        });
    };
    
    /**
     * Requests the Broker to close a protocol.
     * @param {Object} protocol - The protocol to be closed
     * @returns {$q.defer.promise} Resolved when the Broker responds with the close result.
     */
    Public.closeProtocol = function (protocol) {
        return PromenadeBroker.closeProtocol(protocol.getName()).then(function (response) {
            // Search for open protocol requested to be closed.
            var index = Private.open_protocols.findIndex(function (suspect) {
                return protocol.getName() === suspect.getName();
            });
            
            // Remove if we find the protocol, then call it's onClose method.
            /* istanbul ignore else */
            if (index > -1) Private.open_protocols.splice(index, 1)[0].onClose();
            
            ParlayNotification.show({content: 'Closed ' + protocol.getName() + '.'}); 
            
            return response;
        }).catch(function (status) {
	        ParlayNotification.show({content: status});
	        return $q.reject(status);
        });
    };
    
    /**
     * Private Methods
     */
    
    /**
     * Requests both available and open protocols.
     * @returns {$q.defer.promise} - Resolved when both request responses are received.
     */
    Private.requestProtocols = function () {
        return $q.all([Private.requestAvailableProtocols(), Private.requestOpenProtocols()]);
    };
    
    /**
     * 
     */
    Public.requestDiscovery = function () {
        return PromenadeBroker.requestDiscovery(true);
    };
    
    /**
     * Requests available protocols.
     * @returns {$q.defer.promise} - Resolved when request response is recieved.
     */
    Private.requestAvailableProtocols = function () {
        return PromenadeBroker.requestAvailableProtocols();
    };
    
    /**
     * Requests open protocols.
     * @returns {$q.defer.promise} - Resolved when request response is recieved.
     */
    Private.requestOpenProtocols = function () {
        return PromenadeBroker.requestOpenProtocols();
    };
    
    /**
     * Return a open protocol with the given name.
     * @returns {Object} - Returns Protocol object.
     */
    Private.getOpenProtocol = function (name) {
        return Private.open_protocols.find(function (protocol) {
            return name === protocol.getName();
        });
    };
    
    /**
     * Sets private attribute available to an Array of available protocols.
     * @param {Object} protocols - Map of protocol names : protocol details.
     */
    Private.setAvailableProtocols = function (protocols) {
        Private.available_protocols = Object.keys(protocols).map(function (protocol_name) {
            return {
                name: protocol_name,
                parameters: protocols[protocol_name].params.reduce(function (param_obj, current_param) {
                    param_obj[current_param] = {
                        value: null,
                        defaults: protocols[protocol_name].defaults[current_param]
                    };
                    return param_obj;
                }, {})
            };
        });
    };
    
    /**
     * Sets private attribute open to an Array of open protocols.
     * @param {Array} protocols - Array of open protocols.
     */
    Private.setOpenProtocols = function (protocols) {
        Private.open_protocols = protocols.map(function (configuration) {
            var protocol = $injector.has(configuration.protocol_type) ? $injector.get(configuration.protocol_type) : $injector.get('PromenadeDirectMessageProtocol');
            var instance = new protocol(configuration);
            instance.onOpen();
            return instance;
        });        
    };
    
    Private.setSavedProtocols = function () {
	  	var saved = store.getLocalItem("saved");
		if (saved === undefined) return;
		
		// Only show saved configurations that are currently available but not connected.
		Private.saved_protocols = Object.keys(saved).map(function (key) {
		    return saved[key];
	    }).filter(function (configuration) {
		  	return Public.getAvailableProtocols().some(function (protocol) {
			  	return configuration.name === protocol.name;
		  	}) && !Public.getOpenProtocols().some(function (protocol) {
			  	return Object.keys(configuration.parameters).map(function (key) {
				  	return configuration.parameters[key];
			  	}).some(function (value) {
				  	return protocol.protocol_name.indexOf(value) !== -1;
			  	});
		  	});
	  	});  
    };
    
    /**
     * Clears private attributes open and available.
     */
    Private.clearProtocols = function () {
        Private.open_protocols.forEach(function (protocol) {
            protocol.onClose();
        });
        Private.open_protocols = [];
        Private.available_protocols = [];
    };
    
    /**
     * Adds information from discovery to open Protocol instance.
     * @param {Object} info - Discovery information which may be vendor specific.
     */
    Private.addDiscoveryInfoToOpenProtocol = function (info) {
        var protocol = Private.getOpenProtocol(info.NAME);
        if (protocol) protocol.addDiscoveryInfo(info);
    };    
    
    /**
     * PromenadeBroker callback registrations.
     */
    
    PromenadeBroker.onOpen(Private.requestProtocols);
    
    PromenadeBroker.onClose(Private.clearProtocols);
    
    PromenadeBroker.onMessage({type: 'broker', response: 'open_protocol_response'}, Private.requestOpenProtocols);
    
    PromenadeBroker.onMessage({type: 'broker', response: 'close_protocol_response'}, Private.requestOpenProtocols);
    
    PromenadeBroker.onMessage({type: 'broker', response: 'get_protocols_response'}, function (response) {
        Private.setAvailableProtocols(response);
    });
    
    PromenadeBroker.onMessage({type: 'broker', response: 'get_open_protocols_response'}, function (response) {
        Private.setOpenProtocols(response.protocols);
        Private.setSavedProtocols();
    });
    
    PromenadeBroker.onDiscovery(function (response) {
        response.discovery.forEach(Private.addDiscoveryInfoToOpenProtocol);
    });	
    
    return Public;
}

angular.module('parlay.protocols.manager', ['promenade.broker', 'promenade.protocols.directmessage', 'parlay.notification'])
	.factory('ParlayProtocolManager', ['$injector', '$q', 'PromenadeBroker', 'ParlayStore', 'ParlayNotification', ParlayProtocolManager]);