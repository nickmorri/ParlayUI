var socket = angular.module('parlay.socket', ['ngWebsocket']);

socket.value('BrokerAddress', 'ws://' + location.hostname + ':8085');

socket.factory('ParlaySocket', ['ParlaySocketService', function (ParlaySocketService) {
    var Private = {};
    
    // Stores registered socket.
    Private.registeredSocket = undefined;
    
    /**
     * Return registered ParlaySocket.
     * @returns {ParlaySocket} registered ParlaySocket instance or undefined.
     */
    Private.get = function () {
        if (ParlaySocketService.registeredSocket === undefined) {
            ParlaySocketService.registeredSocket = ParlaySocketService();
        }
        return ParlaySocketService.registeredSocket;
    };
    
    return Private.get();
    
}]);

socket.factory('ParlaySocketService', ['BrokerAddress', '$websocket', '$q', function (BrokerAddress, $websocket, $q) {
    
    var Private = {
        onMessageCallbacks: new Map(),
        onOpenCallbacks: [],
        onCloseCallbacks: []
    };
    
    /**
     * Is this a mocked socket? Used for unit testing. Should not be true in production.
     * @returns {Boolean} True if it is a mocked socket, false if not.
     */
    Private.isMock = function () {
        return Private.socket.$mockup();
    };
    
    /**
     * Returns $websocket's config url, where it is connected to.
     * @returns {String} hostname and port
     */
    Private.getAddress = function () {
        return Private.socket.$$config.url;
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
    Private.send = function (topics, contents) {
        if (Private.isMock()) return Private.socket.$emit(Private.encodeTopics(topics), {topics: topics, contents: contents});
        else return Private.socket.$$send({topics: topics, contents: contents});
    };
    
    /**
     * Returns the power set of the given topics.
     * @params {Set} original_set - Set of key/value pairs.
     * @returns {Array} power set of strings
     */
    Private.powerset = function (original_set) {
        var sets = new Set();
        
        if (original_set.size < 1) {
            sets.add(new Set());
            return sets;
        }
        
        var values = original_set.values();
        var head = values.next().value;
        var rest = new Set(values);
        
        Private.powerset(rest).forEach(function (set) {
            var newSet = new Set();
            newSet.add(head);
            set.forEach(function (item) {
                newSet.add(item);
            });
            sets.add(newSet);
            sets.add(set); 
        });
        
        return sets;
    };
    
    /**
     * Returns an array of a all possible encoded topic stings.
     * @params {Object} topics - Map of key/value pairs.
     * @returns {Array} all possible encoded topic stings
     */
    Private.combinationsOf = function (topics) {
        var initial_set = new Set(Object.keys(topics).map(function (key) {
            return key;
        }));
        
        var combinations = [];
        
        Private.powerset(initial_set).forEach(function (set) {
            var topics_combination = {};
            set.forEach(function (key) {
                topics_combination[key] = topics[key];
            });
            combinations.push(Private.encodeTopics(topics_combination));
        });
        
        return combinations;        
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
        else if (topics === undefined) return null;
        else return topics.toString();
    };
    
    /**
     * Sets a key/value pair in the onMessageCallbacks Map where the key is the topics and the value is a callback function.
     * @param {Object} response_topics - Map of key/value pairs.
     * @param {Function} response_callback - Callback function which will be invoked when a messaged is received that topic signature.
     * @param {Bool} persist - If false callback function will be removed after a invocation, if true it will persist.
     * @param {Boolean} verbose - If true we should invoke callback with full message. If false or undefined invoke with only contents for simplicity.
     */
    Private.registerListener = function(response_topics, response_callback, persist, verbose) {
        var encoded_topic_string = Private.encodeTopics(response_topics);

        var callbacks = Private.onMessageCallbacks.get(encoded_topic_string);
        if (callbacks === undefined) callbacks = [];
            
        callbacks.push({func: response_callback, persist: persist, verbose: verbose});
        Private.onMessageCallbacks.set(encoded_topic_string, callbacks);
        
        return function deregisterListener() {
            Private.deregisterListener(encoded_topic_string, response_callback);
        };        
    };
    
    /**
     * Removes the callback associated with the topics and callbackFuncIndex.
     * @param {Object} topics - Map of key/value pairs.
     * @param {Integer} callbackFuncIndex - Position of callback function within array of callbacks.
     */    
    Private.deregisterListener = function (encoded_topics, callbackFuncReference) {
        var callbacks = Private.onMessageCallbacks.get(encoded_topics);
        if (callbacks !== undefined) {
            
            var index = callbacks.findIndex(function (funcObj) {
                return callbackFuncReference === funcObj.func;
            });
            
            // Remove callback from array.
            if (index > -1) callbacks.splice(index, 1);
            
            if (callbacks.length > 0) Private.onMessageCallbacks.set(encoded_topics, callbacks);
            else Private.onMessageCallbacks.delete(encoded_topics);
        }
    };
    
    /**
     * Invokes callbacks associated with the topics, passes contents as parameters.
     * If the callback is not persistent it will be removed after invocation.
     * @param {Object} response_topics - Map of key/value pairs.
     * @param {Object} contents - Map of key/value pairs.
     */
    Private.invokeCallbacks = function (response_topics, contents) {
        Private.combinationsOf(response_topics).forEach(function (encoded_topics) {
            var callbacks = Private.onMessageCallbacks.get(encoded_topics);        
        
            if (callbacks !== undefined) {
                
                var remaining_callbacks = callbacks.filter(function (callback) {
                    if (callback.verbose) callback.func({topics: response_topics, contents: contents});
                    else callback.func(contents);
                    return callback.persist;
                });
                
                if (remaining_callbacks.length > 0) Private.onMessageCallbacks.set(encoded_topics, remaining_callbacks);
                else Private.onMessageCallbacks.delete(encoded_topics);
                
            }
        });
    };
    
    return function (mock) {
        
        var Public = {};
        
        if (mock === undefined || typeof mock === 'object') {            
            Private.socket = $websocket.$new({
                url: BrokerAddress,
                protocol: [],
                enqueue: true,
                reconnect: false,
                mock: mock
            });
        }
        else {
            throw new TypeError('Invalid type for config, accepts mock configuration Object or undefined.', 'socket.js');
        }
        
        Private.public = Public;
        Public._private = Private;
        
        // When the WebSocket opens set the connected status and execute onOpen callbacks.
        Private.socket.$on('$open', function (event) {
            Private.public.connected = Private.socket.$STATUS;
            
            Private.onOpenCallbacks.forEach(function(callback) {
                callback();
            });
        });
        
        // When the WebSocket closes set the connected status and execute onClose callbacks.
        Private.socket.$on('$close', function (event) {
            Private.public.connected = Private.socket.$STATUS;
            
            Private.onCloseCallbacks.forEach(function(callback) {
                callback();
            });
        });
        
        // When the WebSocket receives a message invokeCallbacks.
        // If this is a mock socket we expect a slightly different message structuring.
        Private.socket.$on('$message', function(message) {
            if (Public.isMock()) Private.invokeCallbacks(message.data.topics, message.data.contents);
            else Private.invokeCallbacks(message.topics, message.contents);
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
         * Registers a callback to be associated with topics. Callback is invoked when message is received over WebSocket from Broker with matching signature.
         * @param {Object} response_topics - Map of key/value pairs.
         * @param {Function} response_callback - Callback to invoke upon receipt of message matching response topics.
         * @param {Boolean} verbose - If true we should invoke callback with full message. If false or undefined invoke with only contents for simplicity.
         * @returns {Function} Deregistration function for this message listener.
         */
        Public.onMessage = function (response_topics, response_callback, verbose) {
            // If verbose is not passed default to false.
            var verbosity = verbose ? true : false;
            if (typeof response_topics === 'object') return Private.registerListener(response_topics, response_callback, true, verbosity);
            else throw new TypeError('Invalid type for topics, accepts Map.', 'socket.js');
        };
        
        /**
         * Sends message to connected Broker over WebSocket with associated topics and contents. 
         * Optionally registers a callback which will be called upon reply with matching topic signature.
         * @param {Object} topics - Map of key/value pairs.
         * @param {Object} contents - Map of key/value pairs.
         * @param {Object} response_topics - Map of key/value pairs.
         * @param {Function} response_callback - Callback to invoke upon receipt of message matching response topics.
         * @returns {$q.defer.promise} Resolves once message has been passed to socket.
         */
        Public.sendMessage = function (topics, contents, response_topics, response_callback) {
            
            // Register response callback
            if (response_topics !== undefined || response_callback !== undefined) {
                if (response_topics === undefined || response_callback === undefined) throw new TypeError('If a response callback is desired both response topics and response callback must be defined.', 'socket.js');
                else Private.registerListener(response_topics, response_callback, false);
            }
            
            // Push message down to Private.socket.send()
            if (typeof topics === 'object') {
                if (typeof contents === 'object') return Private.send(topics, contents, response_callback);
                else if (contents === undefined) return Private.send(topics, {}, response_callback);
                else throw new TypeError('Invalid type for contents, accepts Object or undefined.', 'socket.js');
            }
            else throw new TypeError('Invalid type for topics, accepts Object.', 'socket.js');
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
        
        /**
         * Returns host location where socket is connected.
         * @returns {String} hostname and port string
         */
        Public.getAddress = function () {
            return Private.getAddress();
        };
        
        return Public;
            
    };
    
}]);