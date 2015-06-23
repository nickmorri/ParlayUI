var socket = angular.module('parlay.socket', ['ngWebSocket']);

socket.factory('ParlaySocket', ['$websocket', '$q', '$rootScope', function ($websocket, $q, $rootScope) {
    
    var Public = {
        connected: false
    };
    
    var Private = {
        rootScope: $rootScope,
        public: Public,
        socket: $websocket('ws://localhost:' + 8085),
        onMessageCallbacks: new Map(),
        onOpenCallbacks: []
    };
    
    /**
     * 
     */
    Private.socket.onOpen(function (event) {
        Private.rootScope.$applyAsync(function () {
            Private.public.connected = true;
        });
        
        Private.onOpenCallbacks.forEach(function(callback) {
            callback();
        });
    });
    
    Private.socket.onClose(function (event) {
        Private.rootScope.$applyAsync(function () {
            Private.public.connected = false;
        });
    });
    
    Private.socket.onMessage(function(messageEvent) {
        var message = JSON.parse(messageEvent.data);
        Private.invokeCallbacks(message.topics, message.contents);        
    });
    
    Public.onOpen = function (func) {
        Private.onOpenCallbacks.push(func);
    };    
    
    /**
     * Closes $websocket and returns Promise when complete.
     * @returns {$q.defer.promise} Resolved after $websocket.close()
     */
    Private.close = function () {
        $q(function (resolve, reject) {
            Private.socket.close();
            resolve();
        });
    };
    
    /**
     * Passes message down to $websocket.send()
     */
    Private.send = function (message) {
        return Private.socket.send(message);
    };
    
    /**
     * Sets a key/value pair in the onMessageCallbacks Map where the key is the topics and the value is a callback function.
     * @param {Object} topics - Map of key/value pairs.
     * @param {Function} callbackFunc - Callback function which will be invoked when a messaged is received that topic signature.
     * @param {Bool} persist - If false callback function will be removed after a invocation, if true it will persist.
     */
    Private.registerListener = function(topics, callbackFunc, persist) {
        var callbackFuncIndex = 0;
        var callbacks = Private.onMessageCallbacks.get(topics);
            
        if (callbacks !== undefined) callbackFuncIndex = callbacks.push({func: callbackFunc, persist: persist}) - 1;
        else Private.onMessageCallbacks.set(topics, [{func: callbackFunc, persist: persist}]);
        
        Private.doTest();
        
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
        var callbacks = Private.onMessageCallbacks.get(topics);
        callbacks.splice(callbackFuncIndex, 1);
        if (callbacks !== undefined) {
            if (callbacks.length > 0) Private.onMessageCallbacks.set(topics, callbacks);
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
        var callbacks = Private.onMessageCallbacks.get(topics);
        if (callbacks !== undefined) Private.onMessageCallbacks.set(topics, callbacks.filter(function (callback) {
            callback.func(contents);
            return callback.persist;
        }));
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
        if (typeof topics === 'object') {
            if (callbackFunc !== undefined) Private.registerListener(topics, callbackFunc, false);
            return Private.send({topics: topics, contents: contents});
        }
        else {
            throw new TypeError('Invalid type for topics, accepts Map.', 'socket.js');
        }
    };
    
    /**
     * Calls Private.close()
     */
    Public.close = function () {
        return Private.close();
    };
    
    return Public;
}]);