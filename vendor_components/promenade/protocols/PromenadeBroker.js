var broker = angular.module('promenade.broker', ['parlay.socket', 'parlay.notifiction', 'ngMaterial']);

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
        return Public.sendRequest('open_protocol', {'protocol_name': configuration.name, 'params': configuration.parameters});
    };
    
    /**
     * Closes protocol.
     * @param {String} protocol_name - Name of an open protocol.
     * @returns {$q.defer.promise} Resolve when response is received with result of close request from Broker.
     */
    Public.closeProtocol = function (protocol_name) {
        return Public.sendRequest('close_protocol', {'protocol': protocol_name});
    };
        
    /**
     * Request the Broker for a discovery.
     * @param {Boolean} is_forced - Force cached invalidation.
     * @returns {$q.defer.promise} Resolve when response is received with available endpoints.
     */
    Public.requestDiscovery = function (is_forced) {
        
        // Launches ParlayNotification discovery progress after 100 ms
        var progress = $timeout(ParlayNotification.showProgress, 100);
        
        return Public.sendRequest('get_discovery', {'force': is_forced}).then(function (contents) {
            
            // Cancels $timeout callback execution. Better UX for immediate responses from Broker.
            // If $timeout has already executed we should hide the ParlayNotification now.
            if (!$timeout.cancel(progress)) ParlayNotification.hideProgress();
                        
            function buildNotificationMessage(result) {
                var content_string = 'Discovered ';
                        
                if (result.length === 1) {
                    content_string += result[0].NAME + '.';
                }
                else {
                    content_string += result.length + ' devices.';
                }
                
                if (result.length === 0) {
                    content_string += ' Verify connections.';
                }
                return content_string;
            }
            
            ParlayNotification.show({
                content: buildNotificationMessage(contents.discovery)
            });
                
            return contents.discovery;
        });
        
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
     * Sends subscribe message to Broker.
     * @param {Object} request - Contains subscribe request info.
     * @returns {$q.defer.promise} Resolve when response is received.
     */
    Public.sendSubscribe = function (request) {
        return $q(function (resolve, reject) {
            ParlaySocket.sendMessage({'type': 'subscribe'}, request, {'type': 'subscribe_response'}, function (response) {
                resolve(response);    
            });
        });
    };
    
    /**
     * CURRENTLY NOT IMPLEMENTED AT BROKER LEVEL
     * Sends unsubscribe message to Broker.
     * @param {Object} request - Contains unsubscribe request info.
     * @returns {$q.defer.promise} Resolve when response is received.
     */
    Public.sendUnsubscribe = function (request) {
        return $q(function (resolve, reject) {
            resolve('ok');
        });        
        
/*
        return $q(function (resolve, reject) {
            ParlaySocket.sendMessage({'type': 'unsubscribe'}, request, {'type': 'unsubscribe_response'}, function (response) {
                resolve(response);
            });
        });
*/
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
    
    Public.onMessage = ParlaySocket.onMessage;
    Public.onOpen = ParlaySocket.onOpen;
    Public.onClose = ParlaySocket.onClose;
    
    Public.onOpen(function () {
        Private.connected_previously = true;
        // When socket is opened we should show a ParlayNotification to notify the user.
        ParlayNotification.show({
            content: 'Connected to Parlay Broker!'
        });
        
        // Wait for Broker's discovery request.
        Public.onMessage({type: 'broker', command: 'get_discovery'}, function(response) {
	        // Respond with a empty discovery message.
	        ParlaySocket.sendMessage({type: 'broker', response:'get_discovery_response'}, {
		         discovery: []
	        });
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