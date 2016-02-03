function CallbackContainerFactory() {
    "use strict";

    /**
     * Container for registered topics callbacks.
     * Uses EMCAScript 2015 Map() Object internally for storing mappings.
     * @constructor
     */
    function CallbackContainer () {

        // EMCAScript 2015 Map Object.
        var internal_map = new Map();

        /**
         * Adds callback registration for the given topics.
         * @param {Object} topics - Object of key/value pairs.
         * @param {Function} callback - Called when message with matching topics is received.
         * @param {Boolean} persist - If true it will remain active until it is explicitly deregistered otherwise,
         * it will be removed after one invocation.
         * @param {Boolean} verbose - If true both topics and contents are passed to callback, otherwise only contents.
         * @returns {Function} - Deregistration function, if called this resgitration will be removed.
         */
        this.add = function (topics, callback, persist, verbose) {

            var encoded_topics = topics.stableEncode();

            var callbacks = internal_map.get(encoded_topics);

            var callbackObj = {
                func: callback,
                persist: persist,
                verbose: verbose
            };

            if (callbacks !== undefined) callbacks.push(callbackObj);
            else callbacks = [callbackObj];

            internal_map.set(encoded_topics, callbacks);

            return function () { this.delete(topics, callback); }.bind(this);
        };

        /**
         * Removes callback registration for the given topics and callback reference.
         * @param {Object} topics - Object of key/value pairs.
         * @param {Function} callback - Reference to registered callback function.
         * @returns {Boolean} - True if a registration was removed, false otherwise.
         */
        this.delete = function (topics, callback) {

            var encoded_topics = topics.stableEncode();

            var callbacks = internal_map.get(encoded_topics);

            if (callbacks !== undefined) {
                // Search for the location of the callback function.
                var index = callbacks.findIndex(function (funcObj) {
                    return callback === funcObj.func;
                });

                // Remove callback from array if it exists.
                if (index > -1) callbacks.splice(index, 1);

                // Set the updated message callbacks if some still exist.
                if (callbacks.length > 0) internal_map.set(encoded_topics, callbacks);
                else internal_map.delete(encoded_topics);
                return true;
            }
            else {
                return false;
            }
        };

        /**
         * Calls all applicable callbacks for the given topics Object.
         * Will remove any invoked callback that is not persistent.
         * @param {Object} topics - Object of key/value pairs.
         * @param {Object} contents - Object of key/value pairs.
         */
        this.invoke = function (topics, contents) {
            // Generate all possible combinations of topics.
            // This is to ensure that any topic registration that is applicable is invoked.
            topics.combinationsOf().forEach(function (encoded_topics) {
                var callbacks = internal_map.get(encoded_topics);

                // Check that callbacks exist for the given topics.
                if (callbacks !== undefined) {

                    // Invoke all applicable callbacks, retain only persistent callbacks.
                    var remaining_callbacks = callbacks.filter(function (callback) {
                        // If during registration a verbose callback was requested pass topics and contents,
                        // otherwise pass only contents.
                        callback.func(callback.verbose ? {TOPICS: topics, CONTENTS: contents} : contents);

                        // If during registration callback persistence was requested we should keep the callback.
                        return callback.persist;
                    });

                    // Set the updated message callbacks if some still exist.
                    if (remaining_callbacks.length > 0) internal_map.set(encoded_topics, remaining_callbacks);
                    else internal_map.delete(encoded_topics);
                }

            });
        };

        /**
         * Returns number of unique topic keys.
         * @returns {Number} - Count of topics keys.
         */
        this.size = function () {
            return internal_map.size;
        };

        /**
         * Returns number of registered callback functions.
         * @returns {Number} - Count of registered callback functions.
         */
        this.callbackCount = function () {
            var count = 0;
            internal_map.forEach(function (value, key) { count += value.length; });
            return count;
        };

    }

    return CallbackContainer;
}

function ParlaySocketFactory(BrokerAddress, $q, CallbackContainer) {
    "use strict";

    /**
     * ParlaySocket specific Error type that is thrown on invalid messages.
     * @param {String} message - Error message that will be included when thrown.
     * @constructor
     */
    function ParlaySocketError(message) {
        TypeError.call(this, message);
        this.name = "ParlaySocketError";
    }

    // Prototypically inherit from base JavaScript TypeError class.
    ParlaySocketError.prototype = Object.create(TypeError.prototype);

    /**
     * ParlaySocket specific ParlaySocketError type that is thrown on invalid topics.
     * @param {String} type - Invalid type that was given.
     * @constructor
     */
    function TopicsError(type) {
        ParlaySocketError.call(this, "Invalid type for topics, accepts Object but was type " + type + ".");
        this.name = "TopicsError";
    }

    // Prototypically inherit from ParlaySocketError class.
    TopicsError.prototype = Object.create(ParlaySocketError.prototype);

    /**
     * ParlaySocket specific ParlaySocketError type that is thrown on invalid contents.
     * @param {String} type - Invalid type that was given.
     * @constructor
     */
    function ContentsError(type) {
        ParlaySocketError.call(this, "Invalid type for contents, accepts Object or undefined but was type " + type + ".");
        this.name = "TopicsError";
    }

    // Prototypically inherit from ParlaySocketError class.
    ContentsError.prototype = Object.create(ParlaySocketError.prototype);

    /**
     * ParlaySocket is a wrapper around the native HTML WebSocket.
     * ParlaySocket will automatically connect to the Broker address specific in the Angular value BrokerAddress.
     * It provides convenience through registration of callbacks to specific topics and through Promise resolution.
     * @constructor
     */
    function ParlaySocket() {

        // Container that manages topic to callback registrations.
        var onMessageCallbacks = new CallbackContainer();

        // Callbacks that will be called on WebSocket open.
        var onOpenCallbacks = [];

        // Callbacks that will be called on WebSocket close.
        var onCloseCallbacks = [];

        // Queue that holds messages that were attempted to be send while WebSocket was closed.
        var sendQueue = [];

        // Resolved on WebSocket open. If the WebSocket fails to open it will be rejected.
        var onOpenPromise;

        // Resolved on clean WebSocket close. Rejected on unclean WebSocket close.
        var onClosePromise;

        // HTML WebSocket.
        var socket;

        /**
         * Opens WebSocket and returns Promise when complete.
         * @returns {$q.defer.promise} Resolved after WebSocket is opened.
         */
        this.open = function() {
            if (!this.isConnected()) {
                onOpenPromise = $q.defer();
                onClosePromise = $q.defer();
                socket = new WebSocket(BrokerAddress);
                // Attach event handlers.
                socket.onopen = onOpenHandler;
                socket.onclose = onCloseHandler;
                socket.onmessage = onMessageHandler;
            }
            return onOpenPromise.promise;
        };

        /**
         * Closes WebSocket and returns Promise when complete.
         * @returns {$q.defer.promise} Resolved when WebSocket is closed.
         */
        this.close = function() {
            socket.close();
            return onClosePromise.promise;
        };

        /**
         * Sends message to connected Broker over WebSocket with associated topics and contents.
         * Optionally registers a callback which will be called upon reply with matching topic signature.
         * @param {Object} topics - Map of key/value pairs.
         * @param {Object} contents - Map of key/value pairs.
         * @param {Object} response_topics - Map of key/value pairs.
         * @param {Function} response_callback - Callback to invoke upon receipt of message matching response topics.
         * @param {Boolean} verbose - If true we should invoke callback with full message. If false or undefined invoke with only contents for simplicity.
         * @returns {$q.defer.Promise} Resolves once message has been passed to socket.
         */
        this.sendMessage = function(topics, contents, response_topics, response_callback, verbose) {

            // If verbose is not passed default to false.
            var verbosity = verbose === undefined ? false : verbose;

            // Check if either response_topics or response_callbacks is defined.
            if (response_topics !== undefined || response_callback !== undefined) {
                // If one is defined but the other is undefined throw and error.
                if (response_topics === undefined || response_callback === undefined) {
                    throw new ParlaySocketError("If a response callback is desired both response topics and response callback must be defined.");
                }
                // Otherwise we should register a listener.
                else {
                    onMessageCallbacks.add(response_topics, response_callback, false, verbosity);
                }
            }

            // Ensure that topics is an Object.
            if (typeof topics === 'object') {

                // If contents is an Object send both topics and contents.
                if (typeof contents === 'object') {
                    return send(topics, contents);
                }
                // If contents is undefined send only topics and an empty contents Object as a convenience.
                // TODO: Ensure this is desired behavior.
                else if (contents === undefined) {
                    return send(topics, {});
                }
                // If contents is another type throw error.
                else {
                    throw new ContentsError(typeof contents);
                }
            }
            // Otherwise throw error.
            else {
                throw new TopicsError(typeof topics);
            }
        };

        /**
         * Registers a callback to be associated with topics. Callback is invoked when message is received over WebSocket from Broker with matching signature.
         * @param {Object} topics - Map of key/value pairs.
         * @param {Function} callback - Callback to invoke upon receipt of message matching response topics.
         * @param {Boolean} verbose - If true we should invoke callback with full message. If false or undefined invoke with only contents for simplicity.
         * @returns {Function} Deregistration function for this message listener.
         */
        this.onMessage = function(topics, callback, verbose) {
            // If verbose is not passed default to false.
            var verbosity = verbose === undefined ? false : verbose;

            // Ensure that topics is an Object.
            if (typeof topics === 'object') {
                return onMessageCallbacks.add(topics, callback, true, verbosity);
            }
            // Otherwise throw an error.
            else {
                throw new TopicsError(typeof topics);
            }
        };

        /**
         * Checks if WebSocket is open.
         * @returns {Boolean} - True if WebSocket is open, false otherwise.
         */
        this.isConnected = function () {
            return socket !== undefined && socket.readyState === socket.OPEN;
        };

        /**
         * Returns the URL where the WebSocket is connected.
         * @returns {String} - URL.
         */
        this.getAddress = function () {
            return socket.url;
        };

        /**
         * Registers a callback which will be invoked on socket close.
         * @param {Function} callbackFunc - Callback function which will be invoked on WebSocket close.
         */
        this.onClose = function (callbackFunc) {
            onCloseCallbacks.push(callbackFunc);
        };

        /**
         * Registers a callback which will be invoked on socket open.
         * @param {Function} callbackFunc - Callback function which will be invoked on WebSocket open.
         */
        this.onOpen = function (callbackFunc) {
            onOpenCallbacks.push(callbackFunc);
        };

        /**
         * Attempts to send message containing topics and contents on the WebSocket.
         * @param {Object} topics
         * @param {Object} contents
         * @returns {$q.defer.Promise} - Resolved if send completed without exception, rejected otherwise.
         */
        function send(topics, contents) {

            // Stringify the message Object before sending.
            var message = JSON.stringify({TOPICS: topics, CONTENTS: contents});

            var deferred = $q.defer();

            // If socket is open send messages normally.
            if (socket.readyState === socket.OPEN) {
                try {
                    socket.send(message);
                    deferred.resolve();
                }
                catch (e) {
                    deferred.reject(e);
                }
            }
            // Otherwise queue them until the socket opens.
            else {
                sendQueue.push({ message: message, deferred: deferred });
            }

            return deferred.promise;
        }

        /**
         * Attempt to send all messages that were queued while the socket was closed.
         */
        function processSendQueue() {
            sendQueue.forEach(function (container) {
                try {
                    socket.send(container.message);
                    container.deferred.resolve();
                }
                catch (e) {
                    container.deferred.reject();
                }
            });
            sendQueue = [];
        }

        /**
         * Invokes callbacks associated with the topics, passes contents as parameters.
         * If the callback is not persistent it will be removed after invocation.
         * @param {Object} topics - Map of key/value pairs.
         * @param {Object} contents - Map of key/value pairs.
         * TODO: Suspected bottleneck potential. Might need to investigate alternatives.
         * As this function is called per message received and the topics may result in a high number of combinations,
         * this could potentially cause slowdown.
         */
        function invokeCallbacks(topics, contents) {
            onMessageCallbacks.invoke(topics, contents);
        }

        /**
         * Called when WebSocket is opened.
         * @param {MessageEvent} - Event generated by the WebSocket on open.
         */
        function onOpenHandler(event) {
            // If the onOpenPromise exists we should resolve it.
            if (onOpenPromise !== undefined) {
                onOpenPromise.resolve();
                onOpenPromise = undefined;
            }

            // Send any messages that have been queued for sending before the socket had been opened.
            processSendQueue();

            // Process each onOpenCallback
            onOpenCallbacks.forEach(function(callback) { callback(event); });
        }

        /**
         * Called when WebSocket is closed.
         * @param {MessageEvent} - Event generated by the WebSocket on close.
         */
        function onCloseHandler(event) {
            // If the onClosePromise exists we should resolve or reject it.
            if (onClosePromise !== undefined) {
                // If the close event was clean, we shoud resolve the promise.
                if (event.wasClean) {
                    onClosePromise.resolve(event.reason);
                }
                // Otherwise this indicates our connection was severed and we shold reject.
                else {
                    onClosePromise.reject(event.reason);
                }
            }

            // If a onOpenPromise exists that hasn't been resolved we should reject it now.
            if (onOpenPromise !== undefined) {
                onOpenPromise.reject();
                onOpenPromise = undefined;
            }

            // Clear any messages that were pending in the sendQueue as they aren't relevant after a socket close.
            sendQueue = [];

            // Process each onCloseCallback
            onCloseCallbacks.forEach(function(callback) { callback(event); });
        }

        /**
         * Called on receipt of a message on the WebSocket.
         * @param {MessageEvent} - Event generated by the WebSocket containing message contents.
         */
        function onMessageHandler(event) {
            var message = JSON.parse(event.data);
            invokeCallbacks(message.TOPICS, message.CONTENTS);
        }

        // Opens ParlaySocket as soon as possible.
        this.open();

    }

    return new ParlaySocket();

}

angular.module('parlay.socket', [])
	.value('BrokerAddress', location.protocol === 'https:' ? 'wss://' + location.hostname + ':8086' : 'ws://' + location.hostname + ':8085')
    .factory('CallbackContainer', [CallbackContainerFactory])
	.factory('ParlaySocket', ['BrokerAddress', '$q', 'CallbackContainer', ParlaySocketFactory]);