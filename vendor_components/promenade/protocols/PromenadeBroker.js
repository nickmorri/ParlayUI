	
	// Reference to previously instantiated PromenadeBroker.
	var broker_instance;
function PromenadeBrokerFactory(ParlaySocket, $q, ParlayNotification) {
	"use strict";
	
	/**
	 * PromenadeBroker constructor.
	 * @constructor
	 */
	function PromenadeBroker() {
	
	    var connected_previously = false;
	    
	    /**
	     * Sends message to the Broker adding relevant topic fields.
	     * @param {Object} topics - Map of key/value topic pairs.
	     * @param {Object} contents - Map of key/value content pairs.
	     * @param {response_topics} - Map of key/value response topic pairs.
	     * @returns {$q.defer.promise} Resolve when response is received.
	     */
	    this.sendMessage = function(topics, contents, response_topics) {
	        topics.type = "broker";
	        response_topics.type = "broker";
	        
	        return $q(function (resolve, reject) { ParlaySocket.sendMessage(topics, contents, response_topics, resolve); });
	    };
	    
	    /**
		 * Listens for message with relevant response topics from Broker.
		 * @param {Object} response_topics - Map of key/value response topic pairs.
		 * @param {Function} response_callback - Function callback to be called on message receipt.
		 * @returns {Function} - Listener deregistration.
		 */
	    this.onMessage = function(response_topics, response_callback) {
	        response_topics.type = "broker";
	        
	        return ParlaySocket.onMessage(response_topics, response_callback);
	    };
	    
	    /**
	     * Checks if we have connected successfully in the past.
	     * @returns {Boolean} - True if we have connected successfully, false otherwise.
	     */
	    this.hasConnectedPreviously = function() {
	        return connected_previously;
	    };
	    
	    /**
		 * Sets our previous connection status to true.
		 */
	    this.setConnectedPreviously = function() {
		    connected_previously = true;
	    };
	    
	    // Actions that PromenadeBroker needs to perform on ParlaySocket open.
	    // NOTE: Could run into issues if registration occurs after ParlaySocket has been opened. Should investiate solutions.
		ParlaySocket.onOpen(function () {
		    
		    // Request a subscription from the Broker for this protocol.	    
			ParlaySocket.sendMessage({"type": "subscribe"}, {"TOPICS": {"TO": 61953}});
	    	ParlaySocket.sendMessage({"type": "subscribe"}, {"TOPICS": {"TO": "UI"}});
		    
	        this.setConnectedPreviously();
	        
	        ParlayNotification.show({content: "Connected to Parlay Broker!"});
	        
	        // Wait for Broker's discovery request.
	        this.onMessage({command: "get_discovery"}, function(response) {
		        // Respond with a empty discovery message.
		        this.sendMessage({response: "get_discovery_response"}, {discovery: []});
	        });
	        
	    }.bind(this));
	    
	    // Actions that PromenadeBroker needs to perform on ParlaySocket close.
	    // NOTE: Could run into issues if registration occurs after ParlaySocket has been opened. Should investiate solutions.
	    ParlaySocket.onClose(function () {
		    
		    // When socket is closed we should show a notification giving the user the option to reconnect.
		    // If socket failed to open we should show a notification giving the user the option to connect.
		    ParlayNotification.show(this.hasConnectedPreviously() ? {
                content: "Disconnected from Parlay Broker!",
                action: {
                    text: "Reconnect",
                    callback: this.connect
                }
            } : {
                content: "Failed to connect to Parlay Broker!",
                action: {
                    text: "Connect",
                    callback: this.connect
                }
            });
	    }.bind(this));
	    
	}
	
	// Bind ParlaySocket methods to PromenadeBroker.
    PromenadeBroker.prototype.onMessage = ParlaySocket.onMessage;
    PromenadeBroker.prototype.onOpen = ParlaySocket.onOpen;
    PromenadeBroker.prototype.onClose = ParlaySocket.onClose;
    PromenadeBroker.prototype.getBrokerAddress = ParlaySocket.getAddress;
	PromenadeBroker.prototype.connect = ParlaySocket.open;
	PromenadeBroker.prototype.disconnect = ParlaySocket.close;
	PromenadeBroker.prototype.isConnected = ParlaySocket.isConnected;
	
	/**
	 * Request the Broker for a discovery.
	 * @param {Boolean} is_forced - Force cached invalidation.
	 * @returns {$q.defer.promise} Resolve when response is received with available endpoints.
	 */
	PromenadeBroker.prototype.requestDiscovery = function (is_forced) {
	    
	    // Check we are connected first, otherwise display ParlayNotification.
	    if (!this.isConnected()) {
	        ParlayNotification.show({content: "Cannot discover while not connected to Broker."});
	        
	        return $q(function (resolve, reject) {
		        reject("Cannot discover while not connected to Broker.");
	        });
	    }
	    
	    else {
	        ParlayNotification.showProgress();
	        
	        // Request open protocols before discovery so we know what we're discovering.
	        return this.requestOpenProtocols().then(function(open_protocols) {
	            return open_protocols;
	        }).then(function (open_protocols) {
		    	return this.sendMessage({request: "get_discovery"}, {"force": is_forced}, {response: "get_discovery_response"});
		    }.bind(this)).then(function (contents) {	            
	            var content_string = "Discovered ";
	            
	            if (contents.discovery.length === 0) content_string += " Verify connections.";
	            else if (contents.discovery.length === 1) content_string += contents.discovery[0].NAME + ".";
	            else content_string += contents.discovery.length + " protocols.";
	
	            ParlayNotification.show({content: content_string});
	
	            return contents.discovery;
	        });    
	    }
	    
	};
	
	/**
	 * Requests available protocols for connection from the Broker.
	 * @returns {$q.defer.promise} Resolved with available protocols.
	 */
	PromenadeBroker.prototype.requestAvailableProtocols = function () {
	    return this.sendMessage({request: "get_protocols"}, {}, {response: "get_protocols_response"});
	};
	
	/**
	 * Requests open protocols for connection from the Broker.
	 * @returns {$q.defer.promise} Resolved with open protocols.
	 */
	PromenadeBroker.prototype.requestOpenProtocols = function () {
	    return this.sendMessage({request: "get_open_protocols"}, {}, {response: "get_open_protocols_response"}).then(function (response) {
	        if (response.status === "ok") return response.protocols;
	    });
	};
	
	/**
	 * Opens protocol.
	 * @param {Object} configuration - Configuration object we should configure a new protocol connection with.
	 * @returns {$q.defer.promise} Resolve when response is received with result of open request from Broker.
	 */
	PromenadeBroker.prototype.openProtocol = function (configuration) {
	    return this.sendMessage({request: "open_protocol"}, {"protocol_name": configuration.name, "params": configuration.parameters}, {response: "open_protocol_response"}).then(function (response) {
	        return response.STATUS.toLowerCase().indexOf("error") === -1 ? $q.resolve(response) : $q.reject(response.STATUS);
	    });
	};
	
	/**
	 * Closes protocol.
	 * @param {String} protocol_name - Name of an open protocol.
	 * @returns {$q.defer.promise} Resolve when response is received with result of close request from Broker.
	 */
	PromenadeBroker.prototype.closeProtocol = function (protocol_name) {
	    return this.sendMessage({request: "close_protocol"}, {"protocol": protocol_name}, {response: "close_protocol_response"}).then(function (response) {
	        return response.STATUS === "ok" ? $q.resolve(response) : $q.reject(response.STATUS);
	    });
	}; 
	
	/**
	 * Registers a callback on discovery.
	 * @param {Function} callbackFunc - Callback function to be called on message receipt.
	 * @returns {Function} - Listener deregistration.
	 */
	PromenadeBroker.prototype.onDiscovery = function (callbackFunc) {
	    return this.onMessage({"response": "get_discovery_response"}, callbackFunc);
	};
	
	// If we don't have an instance of PromenadeBroker instantiated create it and 
	if (!broker_instance) {
		broker_instance = new PromenadeBroker();
	}
	
	return broker_instance;
}

angular.module("promenade.broker", ["parlay.socket", "parlay.notification", "ngMaterial"])
	.factory("PromenadeBroker", ["ParlaySocket", "$q", "ParlayNotification", PromenadeBrokerFactory]);