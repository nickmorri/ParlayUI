var broker = angular.module('promenade.broker', ['parlay.socket', 'parlay.notification', 'ngMaterial']);

broker.factory('PromenadeBroker', ['ParlaySocket', '$q', 'ParlayNotification', '$timeout', function (ParlaySocket, $q, ParlayNotification, $timeout) {
	
    var Public = {};
    
    var Private = {
        connected_previously: false
    };
    
    Public.getBrokerAddress = function () {
        return ParlaySocket.getAddress();
    };
    
    /**
     * Requests the ParlaySocket to open itself.
     * @returns {$q.defer.promise} Requests the ParlaySocket to open.
     */
    Public.connect = function () {
        return ParlaySocket.open();
    };
    
    /**
     * Requests the ParlaySocket to close itself.
     * @returns {$q.defer.promise} Requests the ParlaySocket to close.
     */
    Public.disconnect = function () {
        return ParlaySocket.close();
    };
    
    /**
     * Check status of underlying ParlaySocket.
     * @returns {Boolean} Requests the ParlaySocket connection status.
     */
    Public.isConnected = function () {
        return ParlaySocket.isConnected();
    };
    
    /**
     * Requests available protocols for connection from the Broker.
     * @returns {$q.defer.promise} Resolved with available protocols.
     */
    Public.requestAvailableProtocols = function () {
        return Public.sendRequest('get_protocols', {});
    };
    
    /**
     * Requests open protocols for connection from the Broker.
     * @returns {$q.defer.promise} Resolved with open protocols.
     */
    Public.requestOpenProtocols = function () {
        return Public.sendRequest('get_open_protocols', {}).then(function (response) {
            if (response.status === 'ok') return response.protocols;
            else Private.handleError(response);            
        });
    };
    
    /**
     * Opens protocol.
     * @param {Object} configuration - Configuration object we should configure a new protocol connection with.
     * @returns {$q.defer.promise} Resolve when response is received with result of open request from Broker.
     */
    Public.openProtocol = function (configuration) {
        return Public.sendRequest('open_protocol', {'protocol_name': configuration.name, 'params': configuration.parameters}).then(function (response) {
	        return response.STATUS.toLowerCase().indexOf("error") === -1 ? $q.resolve(response) : $q.reject(response.STATUS);
        });
    };
    
    /**
     * Closes protocol.
     * @param {String} protocol_name - Name of an open protocol.
     * @returns {$q.defer.promise} Resolve when response is received with result of close request from Broker.
     */
    Public.closeProtocol = function (protocol_name) {
        return Public.sendRequest('close_protocol', {'protocol': protocol_name}).then(function (response) {
	        return response.STATUS === "ok" ? $q.resolve(response) : $q.reject(response.STATUS);
        });
    };
        
    /**
     * Request the Broker for a discovery.
     * @param {Boolean} is_forced - Force cached invalidation.
     * @returns {$q.defer.promise} Resolve when response is received with available endpoints.
     */
    Public.requestDiscovery = function (is_forced) {
        
        // Check we are connected first, otherwise display ParlayNotification.
        if (!Public.isConnected()) {
	        ParlayNotification.show({content: "Cannot discover while not connected to Broker."});
	        return $q(function (resolve, reject) {
		        reject("Cannot discover while not connected to Broker.");
	        });
        }
        
        else {
	        ParlayNotification.showProgress();
	        
	        // Request open protocols before discovery so we know what we're discovering.
	        return Public.requestOpenProtocols().then(function(open_protocols) {
	            return open_protocols;
	        }).then(function (open_protocols) {
		    	return Public.sendRequest('get_discovery', {'force': is_forced});
		    }).then(function (contents) {	            
	            var content_string = "Discovered ";
	            
	            if (contents.discovery.length === 0) content_string += " Verify connections.";
	            else if (contents.discovery.length === 1) content_string += contents.discovery[0].NAME + '.';
	            else content_string += contents.discovery.length + ' protocols.';
	
	            ParlayNotification.show({content: content_string});
	
	            return contents.discovery;
	        });    
        }
        
    };
    
    /**
     * Registers a callback on discovery.
     */
    Public.onDiscovery = function (callbackFunc) {
        return Private.onMessage({'response': 'get_discovery_response'}, callbackFunc);
    };
    
    /**
     * Sends request message to Broker.
     * @returns {$q.defer.promise} Resolve when response is received.
     */
    Public.sendRequest = function (request, contents) {
        return Private.sendMessage({request: request}, contents, {response: request + '_response'});
    };
    
    /**
     * Sends message to the Broker.
     * @returns {$q.defer.promise} Resolve when response is received.
     */
    Private.sendMessage = function (topics, contents, response_topics) {
        topics.type = 'broker';
        response_topics.type = 'broker';
        
        return $q(function (resolve, reject) {
            ParlaySocket.sendMessage(topics, contents, response_topics, function (response) {
                resolve(response);
            });
        });
    };
    
    Private.onMessage = function (response_topics, response_callback) {
        response_topics.type = 'broker';
        
        return ParlaySocket.onMessage(response_topics, response_callback);
    };
    
    Private.hasConnectedPreviously = function () {
        return Private.connected_previously;
    };
    
    Private.subscribe = function () {
	    return $q.all([
	    	ParlaySocket.sendMessage({'type': 'subscribe'},{"TOPICS": {"TO": 61953}}),
	    	ParlaySocket.sendMessage({'type': 'subscribe'},{"TOPICS": {"TO": "UI"}})
	    ]);
    };
    
    Public.onMessage = ParlaySocket.onMessage;
    Public.onOpen = ParlaySocket.onOpen;
    Public.onClose = ParlaySocket.onClose;
    
    ParlaySocket.onOpen(function () {
	    
	    // Request a subscription from the Broker for this protocol.	    
        Private.subscribe();
	    
        Private.connected_previously = true;
        // When socket is opened we should show a ParlayNotification to notify the user.
        ParlayNotification.show({
            content: 'Connected to Parlay Broker!'
        });
        
        // Wait for Broker's discovery request.
        Private.onMessage({command: 'get_discovery'}, function(response) {
	        // Respond with a empty discovery message.
	        Private.sendMessage({response:'get_discovery_response'}, {discovery: []});
        });
        
    });
    
    Public.onClose(function () {
        if (Private.hasConnectedPreviously()) {
            // When socket is closed we should show a notification giving the user the option to reconnect.
            ParlayNotification.show({
                content: 'Disconnected from Parlay Broker!',
                action: {
                    text: 'Reconnect',
                    callback: Public.connect
                }
            });
            
        }
        else {
            // If socket failed to open we should show a notification giving the user the option to connect.           
            ParlayNotification.show({
                content: 'Failed to connect to Parlay Broker!',
                action: {
                    text: 'Connect',
                    callback: Public.connect
                }
            });
        }
    });
    
    return Public;
}]);