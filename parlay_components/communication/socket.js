var socket = angular.module('parlay.socket', ['ngWebsocket', 'ngMaterial']);

socket.factory('ParlaySocket', ['$websocket', '$q', '$rootScope', '$mdToast', function ($websocket, $q, $rootScope, $mdToast) {
    
    var Public = {
        connected: false
    };
    
    var Private = {
        rootScope: $rootScope,
        public: Public,
        onMessageCallbacks: new Map(),
        onOpenCallbacks: [],
        onCloseCallbacks: [],
        onErrorCallbacks: []
    };
    
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
        if (typeof topics === 'object') return Private.send({topics: topics, contents: contents}, callbackFunc);
        else throw new TypeError('Invalid type for topics, accepts Map.', 'socket.js');
    };
    
    /**
     * Calls Private.open()
     * @param {Boolean} mock - If true this is a mock socket, used for testing. Otherwise it is false and for production.
     */
    Public.open = function (mock) {
        if (mock === undefined || !mock) return Private.open(false);
        else return Private.open(mock);
    };
    
    /**
     * Calls Private.close()
     */
    Public.close = function () {
        return Private.close();
    };    
    
    /**
     * Opens $websocket and attaches event listeners.
     * @param {Boolean} mock - If true this is a mock socket, used for testing. Otherwise it is false and for production.
     * @returns {$q.defer.promise} Resolved after WebSocket creation
     */
    Private.open = function (mock) {
        return $q(function (resolve, reject) {
            Private.socket = $websocket.$new({
                url: 'ws://' + location.hostname + ':8085',
                protocol: [],
                lazy: false,
                reconnect: false,
                mock: mock
            });
            
            Private.socket.$on('$open', function (event) {
                Private.rootScope.$applyAsync(function () {
                    Private.public.connected = true;
                });
                
                Private.onOpenCallbacks.forEach(function(callback) {
                    callback();
                });
            });
            
            Private.socket.$on('$close', function (event) {
                Private.rootScope.$applyAsync(function () {
                    Private.public.connected = false;
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
            
            Private.socket.$on('$error', function (event) {
                Private.onErrorCallbacks.forEach(function(callback) {
                    callback();
                });
            });
            
            Private.socket.$on('$message', function(messageEvent) {
                if (messageEvent !== undefined && messageEvent.hasOwnProperty('data')) {
                    var message = JSON.parse(messageEvent.data);
                    Private.invokeCallbacks(message.topics, message.contents);
                }                
            });
            
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
    Private.send = function (message, callbackFunc) {
        if (callbackFunc !== undefined) Private.registerListener(topics, callbackFunc, false);
        return Private.socket.$emit(JSON.stringify(message));
    };
    
    /**
     * Encodes topics by sorting topics by comparison of keys in Unicode code point order.
     * @param {Object} topics - Map of key/value pairs.
     * @returns {String} Translation of key, values to String.
     */
    Private.encodeTopics = function (topics) {
        return Object.keys(topics).sort().reduce(function (previous, current, index) {
            var currentString = previous;
            
            if (index > 0) currentString += ",";
            currentString += '"' + current + '":';
            
            if (typeof topics[current] === "string") currentString += '"' + topics[current] + '"';
            else if (typeof topics[current] === 'number') currentString += topics[current].valueOf();
            else if (typeof topics[current] === 'object') currentString += Private.encodeTopics(topics[current]);
            else currentString += topics[current].toString();
            
            return currentString;
        }, "{") + "}";
    };
    
    /**
     * Sets a key/value pair in the onMessageCallbacks Map where the key is the topics and the value is a callback function.
     * @param {Object} topics - Map of key/value pairs.
     * @param {Function} callbackFunc - Callback function which will be invoked when a messaged is received that topic signature.
     * @param {Bool} persist - If false callback function will be removed after a invocation, if true it will persist.
     */
    Private.registerListener = function(topics, callbackFunc, persist) {
        var callbackFuncIndex = 0;
        var callbacks = Private.onMessageCallbacks.get(Private.encodeTopics(topics));
            
        if (callbacks !== undefined) callbackFuncIndex = callbacks.push({func: callbackFunc, persist: persist}) - 1;
        else Private.onMessageCallbacks.set(Private.encodeTopics(topics), [{func: callbackFunc, persist: persist}]);
        
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
    
    return Public;
}]);