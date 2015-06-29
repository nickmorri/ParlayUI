var socket = angular.module('parlay.socket', ['ngWebsocket', 'ngMaterial']);

socket.factory('ParlaySocketService', function () {
    var ParlaySocketService = {};
    
    // Stores registered sockets by URL
    ParlaySocketService.registeredSockets = {};
    
    // If we find a socket registered to a URL we should return it.
    ParlaySocketService.get = function(url) {
        if (ParlaySocketService.registeredSockets[url] !== undefined) return ParlaySocketService.registeredSockets[url];
        else return undefined;
    };
    
    // Register a socket to a URL.
    ParlaySocketService.register = function (url, socket) {
        ParlaySocketService.registeredSockets[url] = socket;  
    };
    
    return ParlaySocketService;
    
});

socket.factory('ParlaySocket', ['ParlaySocketService', '$websocket', '$q', '$rootScope', '$mdToast', function (ParlaySocketService, $websocket, $q, $rootScope, $mdToast) {
    
    var Private = {
        rootScope: $rootScope,
        onMessageCallbacks: new Map(),
        onOpenCallbacks: [],
        onCloseCallbacks: [],
        onErrorCallbacks: []
    };
    
    /**
     * Is this a mocked socket? Used for unit testing. Should not be true in production.
     * @returns {Boolean} True if it is a mocked socket, false if not.
     */
    Private.isMock = function () {
        return Private.socket.$mockup();
    };
    
    /**
     * Opens $websocket and returns Promise when complete.
     * @returns {$q.defer.promise} Resolved after $websocket.open()
     */
    Private.open = function () {
        $q(function (resolve, reject) {
            Private.socket.$open();
            resolve(); 
        });
    };
        
    /**
     * Closes $websocket and returns Promise when complete.
     * @returns {$q.defer.promise} Resolved after $websocket.close()
     */
    Private.close = function () {
        $q(function (resolve, reject) {
            Private.socket.$close();
            resolve();
        });
    };
    
    /**
     * Passes message down to $websocket.send()
     */
    Private.send = function (topics, contents, callbackFunc) {
        if (callbackFunc !== undefined) Private.registerListener(topics, callbackFunc, false);
        if (Private.isMock()) return Private.socket.$emit(Private.encodeTopics(topics), {topics: topics, contents: contents});
        else return Private.socket.$$send({topics: topics, contents: contents});
    };
    
    /**
     * Encodes topics by sorting topics by comparison of keys in Unicode code point order.
     * @param {Object} topics - Map of key/value pairs.
     * @returns {String} Translation of key, values to String.
     */
    Private.encodeTopics = function (topics) {
        if (typeof topics === 'string') return '"' + topics + '"';
        else if (typeof topics === 'number') return topics.valueOf();
        else if (Array.isArray(topics)) return topics.sort().reduce(function (previous, current, index) {
            var currentString = previous;
            
            if (index > 0) currentString += ",";
            
            return currentString + Private.encodeTopics(current);
        }, "[") + "]";
        else if (typeof topics === 'object') return Object.keys(topics).sort().reduce(function (previous, current, index) {
            var currentString = previous;
            
            if (index > 0) currentString += ",";
            
            return currentString + '"' + current + '":' + Private.encodeTopics(topics[current]);
        }, "{") + "}";
        else return topics.toString();
    };
    
    /**
     * Sets a key/value pair in the onMessageCallbacks Map where the key is the topics and the value is a callback function.
     * @param {Object} topics - Map of key/value pairs.
     * @param {Function} callbackFunc - Callback function which will be invoked when a messaged is received that topic signature.
     * @param {Bool} persist - If false callback function will be removed after a invocation, if true it will persist.
     */
    Private.registerListener = function(topics, callbackFunc, persist) {
        var encoded_topic_string = Private.encodeTopics(topics);
        var callbackFuncIndex = 0;
        var callbacks = Private.onMessageCallbacks.has(encoded_topic_string) ? Private.onMessageCallbacks.get(encoded_topic_string) : [];
            
        callbackFuncIndex = callbacks.push({func: callbackFunc, persist: persist}) - 1;
        Private.onMessageCallbacks.set(encoded_topic_string, callbacks);
        
        return function deregisterListener() {
            Private.deregisterListener(topics, callbackFuncIndex);
        };        
    };
    
    /**
     * Removes the callback associated with the topics and callbackFuncIndex.
     * @param {Object} topics - Map of key/value pairs.
     * @param {Integer} callbackFuncIndex - Position of callback function within array of callbacks.
     */    
    Private.deregisterListener = function (topics, callbackFuncIndex) {
        var callbacks = Private.onMessageCallbacks.get(Private.encodeTopics(topics));
        callbacks.splice(callbackFuncIndex, 1);
        if (callbacks !== undefined) {
            if (callbacks.length > 0) Private.onMessageCallbacks.set(Private.encodeTopics(topics), callbacks);
            else Private.onMessageCallbacks.delete(topics);
        }
    };
    
    /**
     * Invokes callbacks associated with the topics, passes contents as parameters.
     * If the callback is not persistent it will be removed after invocation.
     * @param {Object} topics - Map of key/value pairs.
     * @param {Object} contents - Map of key/value pairs.
     */
    Private.invokeCallbacks = function (topics, contents) {
        var encoded_topics = Private.encodeTopics(topics);
        var callbacks = Private.onMessageCallbacks.get(encoded_topics);
        
        if (callbacks !== undefined) Private.onMessageCallbacks.set(encoded_topics, callbacks.filter(function (callback) {
            callback.func(contents);
            return callback.persist;
        }));
    };
    
    return function (config) {
        
        var Public = {};
        
        // Check to see if we have already registered a socket connection to the requested URL.
        var existingSocket = ParlaySocketService.get(config.url);
        
        if (existingSocket !== undefined) return existingSocket;
        else ParlaySocketService.register(config.url, Public);

        Private.public = Public;
        Public._private = Private;
        
        // If a module has already instantiated the singleton WebSocket instance grab it.
        // Otherwise setup a new WebSocket.
        Private.socket = $websocket.$new({
            url: config.url,
            protocol: [],
            enqueue: true,
            reconnect: false,
            mock: config.mock === undefined ? false : config.mock
        });
        
        // When the WebSocket opens set the connected status and execute onOpen callbacks.
        Private.socket.$on('$open', function (event) {
            Private.rootScope.$applyAsync(function () {
                Private.public.connected = Private.socket.$STATUS;
            });
            
            Private.onOpenCallbacks.forEach(function(callback) {
                callback();
            });
        });
        
        // When the WebSocket closes set the connected status and execute onClose callbacks.
        Private.socket.$on('$close', function (event) {
            Private.rootScope.$applyAsync(function () {
                Private.public.connected = Private.socket.$STATUS;
            });
            
            // When socket is closed we should show a toast alert giving the user the option to reconnect.
            $mdToast.show($mdToast.simple()
                .content('Disconnected from Parlay Broker!')
                .action('Reconnect').highlightAction(true)
                .position('bottom left').hideDelay(3000)).then(Private.open);
            
            Private.onCloseCallbacks.forEach(function(callback) {
                callback();
            });
        });
        
        // When the WebSocket receives a message invokeCallbacks.
        // If this is a mock socket we expect a slightly different message structuring.
        Private.socket.$on('$message', function(messageString) {
            if (Public.isMock()) Private.invokeCallbacks(messageString.data.topics, messageString.data.contents);
            else if (messageString !== undefined) {
                var message = JSON.parse(messageString);
                Private.invokeCallbacks(message.topics, message.contents);
            }                
        });
        
        // When the WebSocket encounters an error execute onError callbacks.
        Private.socket.$on('$error', function (event) {
            Private.onErrorCallbacks.forEach(function(callback) {
                callback();
            });
        });
        
        /**
         * Registers a callback which will be invoked on socket open.
         * @param {Function} callbackFunc - Callback function which will be invoked on socket open.
         */
        Public.onOpen = function (callbackFunc) {
            Private.onOpenCallbacks.push(callbackFunc);
        };
        
        /**
         * Registers a callback which will be invoked on socket close.
         * @param {Function} callbackFunc - Callback function which will be invoked on socket close.
         */
        Public.onClose = function (callbackFunc) {
            Private.onCloseCallbacks.push(callbackFunc);
        };
        
        /**
         * Registers a callback which will be invoked on socket error.
         * @param {Function} callbackFunc - Callback function which will be invoked on socket error.
         */
        Public.onError = function (callbackFunc) {
            Private.onErrorCallbacks.push(callbackFunc);  
        };
        
        /**
         * Registers a callback to be associated with topics. Callback is invoked when message is received over WebSocket from Broker with matching signature.
         * @param {Object} topics - Map of key/value pairs.
         * @param {Function} callbackFunc - Callback function which will be invoked when a messaged is received that topic signature.
         * @returns {Function} Deregistration function for this message listener.
         */
        Public.onMessage = function (topics, callbackFunc) {
            if (typeof topics === 'object') return Private.registerListener(topics, callbackFunc, true);
            else throw new TypeError('Invalid type for topics, accepts Map.', 'socket.js');
        };
        
        /**
         * Sends message to connected Broker over WebSocket with associated topics and contents. 
         * Optionally registers a callback which will be called upon reply with matching topic signature.
         * @param {Object} topics - Map of key/value pairs.
         * @param {Object} contents - Map of key/value pairs.
         * @returns {$q.defer.promise} Resolves once message has been passed to socket.
         */
        Public.sendMessage = function (topics, contents, callbackFunc) {
            if (typeof topics === 'object') return Private.send(topics, contents, callbackFunc);
            else throw new TypeError('Invalid type for topics, accepts Map.', 'socket.js');
        };
        
        /**
         * Calls Private.open()
         */
        Public.open = function () {
            return Private.open();
        };
                
        /**
         * Calls Private.close()
         */
        Public.close = function () {
            return Private.close();
        };
        
        /**
         * Asks Private data if we are using mock socket.
         * @returns {Boolean} True if it is a mocked socket, false if not.
         */
        Public.isMock = function () {
            return Private.isMock();
        };
        
        /**
         * Checks status of underlying WebSocket
         * @returns {Boolean} True if we are currently connected, false if not.
         */
        Public.isConnected = function () {
            Public.connected = Private.socket.$status() === Private.socket.$OPEN;
            return Public.connected;
        };
        
        return Public;
            
    };
    
}]);