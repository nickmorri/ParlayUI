function ParlayProtocolManager($injector, $q, PromenadeBroker, ParlayStore, ParlayNotification) {
    
    var store = ParlayStore("protocols");
    
    var open_protocols = [];
    var available_protocols = [];
    var saved_protocols = [];
    
    var Public = {};
    
    /**
     * Public Methods
     */
    
    /**
     * Returns cached available protocols.
     * @returns {Array} - available protocols.
     */
    Public.getAvailableProtocols = function () {
        return available_protocols;
    };
    
    /**
     * Returns cached open protocols.
     * @returns {Array} - open protocols.
     */
    Public.getOpenProtocols = function () {
        return open_protocols;
    };
    
    /**
	 * Returns saved protocol configurations that are available and not currently connected.
	 * @returns {Array} - Array of protocol configurations.
	 */
    Public.getSavedProtocols = function () {
	    return saved_protocols;
    };
    
    /**
	 * Save the protocol configuration in the ParlayStore.
	 * @param {Object} configuration - Protocol configuration that can be sent to the Broker.
	 */
    function saveProtocolConfiguration(configuration) {
	    var protocols = store.getLocalItem("saved");
	    if (protocols === undefined) protocols = {};
	    
	    configuration.last_connected = new Date();
	    
	    protocols[configuration.name] = configuration;
	    
	    store.setLocalItem("saved", protocols);
	    setSavedProtocols();
    }
    
    /**
	 * Delete the protocol configuration in the ParlayStore.
	 * @param {Object} configuration - Protocol configuration that we are removing from the ParlayStore.
	 */
    Public.deleteProtocolConfiguration = function (configuration) {
		var protocols = store.getLocalItem("saved");
		if (protocols === undefined) return;
		
		delete protocols[configuration.name];
			
		store.setLocalItem("saved", protocols);
		setSavedProtocols();
    };
    
    /**
     * Requests the Broker to open a protocol. 
     * Saves the configuration in ParlayStore for later ease of use.
     * @param {Object} configuration - Contains protocol configuration parameters.
     * @returns {$q.defer.promise} - Resolved when the Broker responds with the open result.
     */
    Public.openProtocol = function (configuration) {
	    return PromenadeBroker.openProtocol(configuration).then(function (response) {
		    saveProtocolConfiguration(configuration);
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
            var index = open_protocols.findIndex(function (suspect) {
                return protocol.getName() === suspect.getName();
            });
            
            // Remove if we find the protocol, then call it's onClose method.
            /* istanbul ignore else */
            if (index > -1) open_protocols.splice(index, 1)[0].onClose();
            
            ParlayNotification.show({content: 'Closed ' + protocol.getName() + '.'}); 
            
            return response;
        }).catch(function (status) {
	        ParlayNotification.show({content: status});
	        return $q.reject(status);
        });
    };
    
    Public.requestDiscovery = function () {
        return PromenadeBroker.requestDiscovery(true);
    };
        
    /**
     * Requests both available and open protocols.
     * @returns {$q.defer.promise} - Resolved when both request responses are received.
     */
    function requestProtocols() {
        return $q.all([requestAvailableProtocols(), requestOpenProtocols()]);
    }
    
    /**
     * Requests available protocols.
     * @returns {$q.defer.promise} - Resolved when request response is recieved.
     */
    function requestAvailableProtocols() {
        return PromenadeBroker.requestAvailableProtocols();
    }
    
    /**
     * Requests open protocols.
     * @returns {$q.defer.promise} - Resolved when request response is recieved.
     */
    function requestOpenProtocols() {
        return PromenadeBroker.requestOpenProtocols();
    }
    
    /**
     * Return a open protocol with the given name.
     * @returns {Object} - Returns Protocol object.
     */
    function getOpenProtocol(name) {
        return open_protocols.find(function (protocol) {
            return name === protocol.getName();
        });
    }
    
    /**
     * Sets private attribute available to an Array of available protocols.
     * @param {Object} protocols - Map of protocol names : protocol details.
     */
    function setAvailableProtocols(protocols) {
        available_protocols = Object.keys(protocols).map(function (protocol_name) {
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
    }
    
    /**
     * Sets private attribute open to an Array of open protocols.
     * @param {Array} protocols - Array of open protocols.
     */
    function setOpenProtocols(protocols) {
        open_protocols = protocols.map(function (configuration) {
            var protocol = $injector.has(configuration.protocol_type) ? $injector.get(configuration.protocol_type) : $injector.get('PromenadeDirectMessageProtocol');
            var instance = new protocol(configuration);
            instance.onOpen();
            return instance;
        });        
    }
    
    function setSavedProtocols() {
	  	var saved = store.getLocalItem("saved");
		if (saved === undefined) return;
		
		// Only show saved configurations that are currently available but not connected.
		saved_protocols = Object.keys(saved).map(function (key) {
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
    }
    
    /**
     * Clears private attributes open and available.
     */
    function clearProtocols() {
        open_protocols.forEach(function (protocol) {
            protocol.onClose();
        });
        open_protocols = [];
        available_protocols = [];
    }
    
    /**
     * Adds information from discovery to open Protocol instance.
     * @param {Object} info - Discovery information which may be vendor specific.
     */
    function addDiscoveryInfoToOpenProtocol(info) {
        var protocol = getOpenProtocol(info.NAME);
        if (protocol) protocol.addDiscoveryInfo(info);
    }
    
    /**
     * PromenadeBroker callback registrations.
     */
    
    PromenadeBroker.onOpen(requestProtocols);
    
    PromenadeBroker.onClose(clearProtocols);
    
    PromenadeBroker.onMessage({type: 'broker', response: 'open_protocol_response'}, requestOpenProtocols);
    
    PromenadeBroker.onMessage({type: 'broker', response: 'close_protocol_response'}, requestOpenProtocols);
    
    PromenadeBroker.onMessage({type: 'broker', response: 'get_protocols_response'}, function (response) {
        setAvailableProtocols(response);
    });
    
    PromenadeBroker.onMessage({type: 'broker', response: 'get_open_protocols_response'}, function (response) {
        setOpenProtocols(response.protocols);
        setSavedProtocols();
    });
    
    PromenadeBroker.onDiscovery(function (response) {
        response.discovery.forEach(addDiscoveryInfoToOpenProtocol);
    });	
    
    return Public;
}

angular.module('parlay.protocols.manager', ['promenade.broker', 'promenade.protocols.directmessage', 'parlay.notification'])
	.factory('ParlayProtocolManager', ['$injector', '$q', 'PromenadeBroker', 'ParlayStore', 'ParlayNotification', ParlayProtocolManager]);