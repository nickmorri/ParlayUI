var broker = angular.module('promenade.broker', ['parlay.socket']);

broker.value('BrokerAddress', 'ws://' + location.hostname + ':8085');

broker.factory('PromenadeBroker', ['ParlaySocket', '$q', 'BrokerAddress', function (ParlaySocket, $q, BrokerAddress) {
    var Public = {};
    
    var Private = {
        socket: ParlaySocket(BrokerAddress)
    };
    
    Public.getBrokerAddress = function () {
        return BrokerAddress;
    };
    
    /**
     * Requests the ParlaySocket to open itself.
     * @returns {$q.defer.promise} Requests the ParlaySocket to open.
     */
    Public.connect = function () {
        return Private.socket.open();
    };
    
    /**
     * Requests the ParlaySocket to close itself.
     * @returns {$q.defer.promise} Requests the ParlaySocket to close.
     */
    Public.disconnect = function () {
        return Private.socket.close();
    };
    
    /**
     * Check status of underlying ParlaySocket.
     * @returns {Boolean} Requests the ParlaySocket connection status.
     */
    Public.isConnected = function () {
        return Private.socket.isConnected();
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
     * @returns {$q.defer.promise} Resolve when response is recieved with result of open request from Broker.
     */
    Public.openProtocol = function (configuration) {
        return Public.sendRequest('open_protocol', {'protocol_name': configuration.name, 'params': configuration.parameters});
    };
    
    /**
     * Closes protocol.
     * @param {Object} protocol - Configured open protocol object.
     * @returns {$q.defer.promise} Resolve when response is recieved with result of close request from Broker.
     */
    Public.closeProtocol = function (protocol) {
        return Public.sendRequest('close_protocol', {'protocol': protocol.name});
    };
        
    /**
     * Request the Broker for a discovery.
     * @param {Boolean} is_forced - Force cached invalidation.
     * @returns {$q.defer.promise} Resolve when response is recieved with available endpoints.
     */
    Public.requestDiscovery = function (is_forced) {
        return Public.sendRequest('get_discovery', {'force': is_forced}).then(function (contents) {
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
     * @returns {$q.defer.promise} Resolve when response is recieved.
     */
    Public.sendRequest = function (request, contents) {
        return Private.sendMessage({request: request}, contents, {response: request + '_response'});
    };
    
    /**
     * Sends message to the Broker.
     * @returns {$q.defer.promise} Resolve when response is recieved.
     */
    Private.sendMessage = function (topics, contents, response_topics) {
        topics.type = 'broker';
        response_topics.type = 'broker';
        
        return $q(function (resolve, reject) {
            Private.socket.sendMessage(topics, contents, response_topics, function (response) {
                resolve(response);
            });
        });
    };
    
    Private.onMessage = function (response_topics, response_callback) {
        response_topics.type = 'broker';
        
        return Private.socket.onMessage(response_topics, response_callback);
    };
    
    /**
     * Handles directing error to correct place.
     * @param {Object} Response contents from Broker.
     */
    Private.handleError = function () {
        // Do something.
    };
    
    Public.onMessage = Private.socket.onMessage;
    Public.onOpen = Private.socket.onOpen;
    Public.onClose = Private.socket.onClose;
    Public.onError = Private.socket.onError;
    
    return Public;
}]);