function ParlaySocketFactory(ParlaySocketService) {
    // Stores registered socket.
    var registeredSocket;
    
    if (registeredSocket === undefined) registeredSocket = ParlaySocketService();
    return registeredSocket;
}

function ParlaySocketServiceFactory(BrokerAddress, $websocket, $q) {
    
    var onMessageCallbacks = new Map();
    var onOpenCallbacks = [];
    var onCloseCallbacks = [];
    var onOpenPromise;
    var onClosePromise;
    var socket;
    
    /**
     * Is this a mocked socket? Used for unit testing. Should not be true in production.
     * @returns {Boolean} True if it is a mocked socket, false if not.
     */
    function isMock() {
        return socket.$mockup();
    }
    
    /**
     * Returns $websocket's config url, where it is connected to.
     * @returns {String} hostname and port
     */
    function getAddress() {
        return socket.$$config.url;
    }
    
    /**
     * Opens $websocket and returns Promise when complete.
     * @returns {$q.defer.promise} Resolved after $websocket.open()
     */
    function open() {
	    onOpenPromise = $q.defer();
	    socket.$open();
	    return onOpenPromise.promise;
    }
        
    /**
     * Closes $websocket and returns Promise when complete.
     * @returns {$q.defer.promise} Resolved after $websocket.close()
     */
    function close() {
	    onClosePromise = $q.defer();
	    socket.$close();
        return onClosePromise.promise;
    }
    
    /**
     * Passes message down to $websocket.send()
     */
	 function send(topics, contents) {
        if (isMock()) return socket.$emit(encodeTopics(topics), {TOPICS: topics, CONTENTS: contents});
        else return socket.$$send({TOPICS: topics, CONTENTS: contents});
    }
    
    /**
     * Returns the power set of the given topics.
     * @params {Set} original_set - Set of key/value pairs.
     * @returns {Array} power set of strings
     */
    function powerset(original_set) {
        var sets = new Set();
        
        if (original_set.size < 1) {
            sets.add(new Set());
            return sets;
        }
        
        var values = original_set.values();
        var head = values.next().value;
        var rest = new Set(values);
        
        powerset(rest).forEach(function (set) {
            var newSet = new Set();
            newSet.add(head);
            set.forEach(function (item) {
                newSet.add(item);
            });
            sets.add(newSet);
            sets.add(set); 
        });
        
        return sets;
    }
    
    /**
     * Returns an array of a all possible encoded topic stings.
     * @params {Object} topics - Map of key/value pairs.
     * @returns {Array} all possible encoded topic stings
     */
    function combinationsOf(topics) {
        var initial_set = new Set(Object.keys(topics).map(function (key) {
            return key;
        }));
        
        var combinations = [];
        
        powerset(initial_set).forEach(function (set) {
            var topics_combination = {};
            set.forEach(function (key) {
                topics_combination[key] = topics[key];
            });
            combinations.push(encodeTopics(topics_combination));
        });
        
        return combinations;        
    }
    
    /**
     * Encodes topics by sorting topics by comparison of keys in Unicode code point order.
     * @param {Object} topics - Map of key/value pairs.
     * @returns {String} Translation of key, values to String.
     */
    function encodeTopics(topics) {
        if (typeof topics === 'string') return '"' + topics + '"';
        else if (typeof topics === 'number') return topics.valueOf();
        else if (Array.isArray(topics)) return topics.sort().reduce(function (previous, current, index) {
            var currentString = previous;
            
            if (index > 0) currentString += ",";
            
            return currentString + encodeTopics(current);
        }, "[") + "]";
        else if (topics === undefined || topics === null) return "null";
        else if (typeof topics === 'object') return Object.keys(topics).sort().reduce(function (previous, current, index) {
            var currentString = previous;
            
            if (index > 0) currentString += ",";
            
            return currentString + '"' + current + '":' + encodeTopics(topics[current]);
        }, "{") + "}";
        else return topics.toString();
    }
    
    /**
     * Sets a key/value pair in the onMessageCallbacks Map where the key is the topics and the value is a callback function.
     * @param {Object} response_topics - Map of key/value pairs.
     * @param {Function} response_callback - Callback function which will be invoked when a messaged is received that topic signature.
     * @param {Bool} persist - If false callback function will be removed after a invocation, if true it will persist.
     * @param {Boolean} verbose - If true we should invoke callback with full message. If false or undefined invoke with only contents for simplicity.
     */
    function registerListener(response_topics, response_callback, persist, verbose) {
        var encoded_topic_string = encodeTopics(response_topics);

        var callbacks = onMessageCallbacks.get(encoded_topic_string);
        if (callbacks === undefined) callbacks = [];
            
        callbacks.push({func: response_callback, persist: persist, verbose: verbose});
        onMessageCallbacks.set(encoded_topic_string, callbacks);
        
        return function () {
            deregisterListener(encoded_topic_string, response_callback);
        };        
    }
    
    /**
     * Removes the callback associated with the topics and callbackFuncIndex.
     * @param {Object} topics - Map of key/value pairs.
     * @param {Integer} callbackFuncIndex - Position of callback function within array of callbacks.
     */    
    function deregisterListener(encoded_topics, callbackFuncReference) {
        var callbacks = onMessageCallbacks.get(encoded_topics);
        if (callbacks !== undefined) {
            
            var index = callbacks.findIndex(function (funcObj) {
                return callbackFuncReference === funcObj.func;
            });
            
            // Remove callback from array.
            if (index > -1) callbacks.splice(index, 1);
            
            if (callbacks.length > 0) onMessageCallbacks.set(encoded_topics, callbacks);
            else onMessageCallbacks.delete(encoded_topics);
        }
    }
    
    /**
     * Invokes callbacks associated with the topics, passes contents as parameters.
     * If the callback is not persistent it will be removed after invocation.
     * @param {Object} response_topics - Map of key/value pairs.
     * @param {Object} contents - Map of key/value pairs.
     */
    function invokeCallbacks(response_topics, contents) {
        combinationsOf(response_topics).forEach(function (encoded_topics) {
            var callbacks = onMessageCallbacks.get(encoded_topics);        
        
            if (callbacks !== undefined) {
                
                var remaining_callbacks = callbacks.filter(function (callback) {
                    if (callback.verbose) callback.func({TOPICS: response_topics, CONTENTS: contents});
                    else callback.func(contents);
                    return callback.persist;
                });
                
                if (remaining_callbacks.length > 0) onMessageCallbacks.set(encoded_topics, remaining_callbacks);
                else onMessageCallbacks.delete(encoded_topics);
                
            }
        });
    }
    
    return function ParlaySocket(mock) {
        
        if (mock !== undefined && typeof mock !== 'object') {            
            throw new TypeError('Invalid type for config, accepts mock configuration Object or undefined.', 'socket.js');
        }
        
        socket = $websocket.$new({
            lazy: true,
            url: BrokerAddress,
            protocol: [],
            enqueue: true,
            reconnect: false,
            mock: mock
        });
        
        open();
        
        // When the WebSocket opens set the connected status and execute onOpen callbacks.
        socket.$on('$open', function (event) {
            
            if (onOpenPromise !== undefined) {
	            onOpenPromise.resolve();
	            onOpenPromise = undefined;
            }
            
            onOpenCallbacks.forEach(function(callback) {
                callback();
            });
        });
        
        // When the WebSocket closes set the connected status and execute onClose callbacks.
        socket.$on('$close', function (event) {
            
            if (onClosePromise !== undefined) {
	            onClosePromise.resolve();
	            onClosePromise = undefined;
            }
            
            if (onOpenPromise !== undefined) {
	            onOpenPromise.reject();
	            onOpenPromise = undefined;
            }
            
            onCloseCallbacks.forEach(function(callback) {
                callback();
            });
        });
        
        // When the WebSocket receives a message invokeCallbacks.
        // If this is a mock socket we expect a slightly different message structuring.
        socket.$on('$message', function(message) {
            if (isMock()) invokeCallbacks(message.data.TOPICS, message.data.CONTENTS);
            else invokeCallbacks(message.TOPICS, message.CONTENTS);
        });
                
        return {
	        _private: isMock() ? {
		        encodeTopics: encodeTopics
	        } : undefined,
	        open: open,
	        close: close,
	        isMock: isMock,
	        isConnected: function isConnected() {
		        return socket.$status() === socket.$OPEN;
	        },
	        getAddress: getAddress,
	        /**
	         * Sends message to connected Broker over WebSocket with associated topics and contents. 
	         * Optionally registers a callback which will be called upon reply with matching topic signature.
	         * @param {Object} topics - Map of key/value pairs.
	         * @param {Object} contents - Map of key/value pairs.
	         * @param {Object} response_topics - Map of key/value pairs.
	         * @param {Function} response_callback - Callback to invoke upon receipt of message matching response topics.
	         * @param {Boolean} verbose - If true we should invoke callback with full message. If false or undefined invoke with only contents for simplicity.
	         * @returns {$q.defer.promise} Resolves once message has been passed to socket.
	         */
	        sendMessage: function sendMessage(topics, contents, response_topics, response_callback, verbose) {
	            // If verbose is not passed default to false.
	            var verbosity = verbose ? true : false;	            
	            // Register response callback
	            if (response_topics !== undefined || response_callback !== undefined) {
	                if (response_topics === undefined || response_callback === undefined) throw new TypeError('If a response callback is desired both response topics and response callback must be defined.', 'socket.js');
	                else registerListener(response_topics, response_callback, false, verbosity);
	            }
	            
	            // Push message down to socket.send()
	            if (typeof topics === 'object') {
	                if (typeof contents === 'object') return send(topics, contents, response_callback);
	                else if (contents === undefined) return send(topics, {}, response_callback);
	                else throw new TypeError('Invalid type for contents, accepts Object or undefined.', 'socket.js');
	            }
	            else throw new TypeError('Invalid type for topics, accepts Object.', 'socket.js');
	        },
	        /**
	         * Registers a callback to be associated with topics. Callback is invoked when message is received over WebSocket from Broker with matching signature.
	         * @param {Object} response_topics - Map of key/value pairs.
	         * @param {Function} response_callback - Callback to invoke upon receipt of message matching response topics.
	         * @param {Boolean} verbose - If true we should invoke callback with full message. If false or undefined invoke with only contents for simplicity.
	         * @returns {Function} Deregistration function for this message listener.
	         */
	        onMessage: function onMessage(response_topics, response_callback, verbose) {
	            // If verbose is not passed default to false.
	            var verbosity = verbose ? true : false;
	            if (typeof response_topics === 'object') return registerListener(response_topics, response_callback, true, verbosity);
	            else throw new TypeError('Invalid type for topics, accepts Map.', 'socket.js');
	        },
	        /**
	         * Registers a callback which will be invoked on socket close.
	         * @param {Function} callbackFunc - Callback function which will be invoked on socket close.
	         */
	        onClose: function onClose(callbackFunc) {
	            onCloseCallbacks.push(callbackFunc);
	        },
	        /**
	         * Registers a callback which will be invoked on socket open.
	         * @param {Function} callbackFunc - Callback function which will be invoked on socket open.
	         */
	        onOpen: function onOpen(callbackFunc) {
	            onOpenCallbacks.push(callbackFunc);
	        }
        };            
    };
    
}

angular.module('parlay.socket', ['ngWebsocket'])
	.value('BrokerAddress', location.protocol === 'https:' ? 'wss://' + location.hostname + ':8086' : 'ws://' + location.hostname + ':8085')
	.factory('ParlaySocket', ['ParlaySocketService', ParlaySocketFactory])
	.factory('ParlaySocketService', ['BrokerAddress', '$websocket', '$q', ParlaySocketServiceFactory]);