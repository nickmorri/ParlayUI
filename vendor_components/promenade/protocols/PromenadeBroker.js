function PromenadeBrokerFactory(ParlaySocket, $q, $timeout, ParlayNotification, ParlayErrorDialog) {
	"use strict";
	
	/**
	 * PromenadeBroker constructor.
	 * @constructor
	 */
	function PromenadeBroker() {
	
	    var connected_previously = false;
		var last_discovery;

		var on_discovery_callbacks = [];
	    
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
	        
	        return $q(function (resolve) { ParlaySocket.sendMessage(topics, contents, response_topics, resolve); });
	    };
	    
	    /**
		 * Listens for message with relevant response topics from Broker.
		 * @param {Object} response_topics - Map of key/value response topic pairs.
		 * @param {Function} response_callback - Function callback to be called on message receipt.
         * @param {Boolean} verbose - If true we should invoke callback with full message. If false or undefined invoke with only contents for simplicity.
		 * @returns {Function} - Listener deregistration.
		 */
	    this.onMessage = function(response_topics, response_callback, verbose) {
	        if (response_topics === undefined) response_topics.type = "broker";
	        
	        return ParlaySocket.onMessage(response_topics, response_callback, verbose);
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

        /**
         * Stores discovery data in private variable.
         * @param {Object} data - Discovery data.
         */
        this.setLastDiscovery = function(data) {
            last_discovery = data;
        };

        /**
         * Retrieves latest private discovery data.
         * @returns {Object} - Latest discovery data object
         */
        this.getLastDiscovery = function() {
            return last_discovery;
        };

		this.setSavedDiscovery = function(data) {
			on_discovery_callbacks.forEach(function (callback) {
				callback({discovery: data});
			});
		};

		/**
		 * Registers a callback on discovery.
		 * @param {Function} callbackFunc - Callback function to be called on message receipt.
		 */
		this.onDiscovery = function (callbackFunc) {
			on_discovery_callbacks.push(callbackFunc);
		};

		/**
		 * Register a callback on get_discovery_response. Call all registered discovery callbacks.
		 */
		this.onMessage({"response": "get_discovery_response"}, function (response) {
			on_discovery_callbacks.forEach(function (callback) {
				callback(response);
			});
		});

        /**
         * Register a callback on MSG_STATUS == 'ERROR' so that we can display a dialog.
         */
        this.onMessage({"MSG_STATUS": "ERROR"}, function (response) {
			ParlayErrorDialog.show(response.TOPICS.FROM, response.CONTENTS.DESCRIPTION, response);
        }, true);

        /**
         * Register a callback on MSG_STATUS == 'WARNING' so that we can display a dialog.
         */
        this.onMessage({"MSG_STATUS": "WARNING"}, function (response) {
            ParlayNotification.show({content: response, warning: true});
        });

		/**
		 * Register PromenadeBroker's notification callback for discovery.
		 */
		this.onDiscovery(function (contents) {
			// Build the contents of the notification to display.
			var content_string;

			if (contents.discovery.length === 1) {
				content_string = "Discovered " + contents.discovery[0].NAME + ".";
			}
			else if (contents.discovery.length > 1) {
				content_string = "Discovered " + contents.discovery.length + " protocols.";
			}
			else {
				content_string = "Discovered 0 protocols. Verify connections.";
			}

			ParlayNotification.show({content: content_string});

			// Store latest discovery data.
			this.setLastDiscovery(contents.discovery);
		}.bind(this));

	    // Actions that PromenadeBroker needs to perform on ParlaySocket open.
	    // TODO: Could run into issues if registration occurs after ParlaySocket has been opened.
		ParlaySocket.onOpen(function () {
		    
		    // Request a subscription from the Broker for this protocol.	    
			ParlaySocket.sendMessage({"type": "subscribe"}, {"TOPICS": {"TO": 61953}});
	    	ParlaySocket.sendMessage({"type": "subscribe"}, {"TOPICS": {"TO": "UI"}});
		    
	        this.setConnectedPreviously();
	        
	        ParlayNotification.show({content: "Connected to Parlay Broker!"});

	        // Wait for Broker's discovery request and respond with a empty discovery message.
	        this.onMessage({'type': "get_protocol_discovery"}, function() {
                ParlaySocket.sendMessage({type: "get_protocol_discovery_response"}, {discovery: {}});
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
                    callback: this.connect.bind(this)
                },
                permanent: true,
                warning: true
            } : {
                content: "Failed to connect to Parlay Broker!",
                action: {
                    text: "Connect",
					callback: this.connect.bind(this)
                }
            });
	    }.bind(this));
	    
	}
	
	// Bind ParlaySocket methods to PromenadeBroker.
    PromenadeBroker.prototype.onOpen = ParlaySocket.onOpen;
    PromenadeBroker.prototype.onClose = ParlaySocket.onClose;
    PromenadeBroker.prototype.getBrokerAddress = ParlaySocket.getAddress;
	PromenadeBroker.prototype.connect = ParlaySocket.open;
	PromenadeBroker.prototype.disconnect = ParlaySocket.close;
	PromenadeBroker.prototype.isConnected = ParlaySocket.isConnected;
	
	/**
	 * Request the Broker for a discovery.
	 * @param {Boolean} is_forced - Force cached invalidation.
	 * @returns {$q.defer.promise} Resolve when response is received with available items.
	 */
	PromenadeBroker.prototype.requestDiscovery = function (is_forced) {
	    // Check we are connected first, otherwise display ParlayNotification.
	    if (this.isConnected()) {

            // $q Deferred that will be resolved upon discovery response.
            var deferred = $q.defer();

            // Wait before displaying the discovery progress notification in case of a quick discovery response.
            var registration = $timeout(function () {
                // Show progress and pass deferred so that we can hide hide dialog when it is resolved.
                ParlayNotification.showProgress(deferred);
            }, 500);

			return this.sendMessage({request: "get_discovery"}, {"force": !!is_forced}, {response: "get_discovery_response"}).then(function (response) {
                // Resolve deferred so that dialog can be hidden once response is received.
                deferred.resolve(response);

                // Prevent the dialog from displaying if we receive a quick discovery response.
                $timeout.cancel(registration);
                return response;
            });
		}
	    else {
	        ParlayNotification.show({content: "Cannot discover while not connected to Broker."});

			return $q(function (resolve, reject) { reject("Cannot discover while not connected to Broker."); });
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

	return new PromenadeBroker();
}

angular.module("promenade.broker", ["parlay.socket", "parlay.notification", "parlay.notification.error", "ngMaterial"])
	.factory("PromenadeBroker", ["ParlaySocket", "$q", "$timeout", "ParlayNotification", "ParlayErrorDialog", PromenadeBrokerFactory]);