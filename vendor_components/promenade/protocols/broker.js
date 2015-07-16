var broker = angular.module('promenade.broker', ['parlay.socket', 'ngMaterial']);

broker.factory('PromenadeBroker', ['ParlaySocket', '$q', '$mdToast', function (ParlaySocket, $q, $mdToast) {
    var Public = {};
    
    var Private = {};
    
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
    
    /**
     * Handles directing error to correct place.
     * @param {Object} Response contents from Broker.
     */
    Private.handleError = function () {
        // Do something.
    };
    
    Public.onMessage = ParlaySocket.onMessage;
    Public.onOpen = ParlaySocket.onOpen;
    Public.onClose = ParlaySocket.onClose;
    Public.onError = ParlaySocket.onError;
    
    Public.onOpen(function () {
        // When socket is opened we should show a toast alert to notify the user.
        $mdToast.show($mdToast.simple()
            .content('Connected to Parlay Broker!'));
    });
    
    Public.onClose(function () {
        // When socket is closed we should show a toast alert giving the user the option to reconnect.
        $mdToast.show($mdToast.simple()
            .content('Disconnected from Parlay Broker!')
            .action('Reconnect').highlightAction(true)
            .position('bottom left').hideDelay(3000)).then(Public.connect);
    });
    
    return Public;
}]);