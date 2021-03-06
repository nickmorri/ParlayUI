(function () {
    "use strict";

    /**
     * @module ParlaySocket
     *
     * @description
     * ParlaySocket wraps the native WebSocket and provides a support for the publish/subscribe protocol used by Parlay.
     *
     */

    var module_dependencies = [];

    angular
        .module('parlay.socket', module_dependencies)
        .value('BrokerAddress', location.hostname)
        .factory('CallbackContainer', CallbackContainerFactory)
        .factory('ParlaySocket', ParlaySocketFactory);

    /**
     * Encodes Object by sorting comparing keys in Unicode code point order.
     * @returns {String} Translation of key, values to String.
     */
    Object.defineProperty(Object.prototype, "stableEncode", {
        writable: false,
        enumerable: false,
        value: function() {
            if (typeof this === 'string' || this instanceof String) {
                return '"' + this + '"';
            }
            else if (typeof this === 'number' || this instanceof Number) {
                return this.toString();
            }
            else if (typeof this === 'boolean' || this instanceof Boolean) {
                return this.toString();
            }
            else if (Array.isArray(this)) {
                return this.sort().reduce(function (previous, current, index) {
                        var currentString = previous;

                        if (index > 0) currentString += ",";

                        var current_encoded = current === null || current === undefined ? "null" : current.stableEncode();

                        return currentString + current_encoded;
                    }, "[") + "]";
            }
            else if (typeof this === 'object') {
                return Object.keys(this).sort().reduce(function (previous, current, index) {
                        var currentString = previous;

                        if (index > 0) currentString += ",";

                        var current_encoded = this[current] === null || this[current] === undefined ? "null" : this[current].stableEncode();

                        return currentString + '"' + current + '":' + current_encoded;
                    }.bind(this), "{") + "}";
            }
            else {
                return this.toString();
            }
        }
    });

    function CallbackContainerFactory () {

        /**
         * Container for registered topics callbacks.
         * Uses [ECMAScript 2015 Map()]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map} Object internally for storing mappings.
         * @constructor module:ParlaySocket.CallbackContainer
         */
        function CallbackContainer () {

            /**
             * [ECMAScript 2015 Map()]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map}.
             * @member module:ParlaySocket.CallbackContainer#internal_map
             * @private
             * @type {Map}
             */
            var internal_map = new Map();

            /**
             * This won't collide with any possible hash because it doesn't match the get_hash function that other keys use.
             * This is the key that will be used for the callback list.
             * @member module:ParlaySocket.CallbackContainer#callback_key
             * @private
             * @type {String}
             */
            var callback_key = "__CALLBACK__";

            var container = this;

            // Attach methods to CallbackContainer.
            container.add = add;
            container.remove = remove;
            container.invoke = invoke;
            container.size = size;
            container.callbackCount = callbackCount;
            container.maxDepth = maxDepth;

            /**
             * Get the hash for a particular key value pair to put in the map.
             * @member module:ParlaySocket.CallbackContainer#get_hash
             * @private
             * @param {Object} key - topic or content key.
             * @param {Object} value - topic or content value.
             * @return {String} - formatted String containing a stable encoded key and value.
             */
            function get_hash (key, value) {
                if (key === undefined || key === "undefined") {
                    key = "__undefined__";
                }
                if (value === undefined || value === "undefined") {
                    value = "__undefined__";
                }
                return 'k=' + key.stableEncode() + ':v=' + value.stableEncode();
            }

            /**
             * Traverse tree and delete branches of tree if no longer needed.
             * @member module:ParlaySocket.CallbackContainer#prune
             * @private
             * @param {Map} map - Tree-like structure that contains topic registrations.
             */
            function prune (map) {

                // Check if entry for callback Array exists, if it does and it is empty we should delete it.
                if (map.has(callback_key) && map.get(callback_key).length === 0) {
                    map.delete(callback_key);
                }

                // Iterate through the entries in the map.
                var iter = map.entries();
                for (var current = iter.next(); !current.done; current = iter.next()) {

                    // Recursively prune all sub-trees, if the size of the sub-tree is 0 delete it.
                    if (current.value[0] !== callback_key && prune(current.value[1]) === 0) {
                        map.delete(current.value[0]);
                    }

                }

                return map.size;
            }

            /**
             * Traverses the leaves of the subscribed topics tree and returns the callbacks associated.
             * @member module:ParlaySocket.CallbackContainer#get_callbacks_for_topics
             * @private
             * @param {Object} topics - Object of key/value pairs.
             * @returns {Array} - Array of callbacks that have been registered for the given topics.
             */
            function get_callbacks_for_topics (topics) {
                // This will be the map that we encode (sorted so we're stable).
                var keys = Object.keys(topics).sort();

                var leaf_map = internal_map;

                // Special case, of keys are empty, then just append to root map.
                // If not empty then go through chain.
                if (keys.length > 0) {
                    var init_key = keys.shift();
                    var init_hash = get_hash(init_key, topics[init_key]);

                    // Take the first one out.
                    leaf_map = internal_map.get(init_hash) || new Map();

                    // Re-set it in case its new.
                    internal_map.set(init_hash, leaf_map);

                    keys.map(function (key) {
                        // Get the hash for each key, value pair.
                        return get_hash(key, topics[key]);
                    }).forEach(function (hash) {
                        // Get the map for each hash or a new Map() if undefined.
                        var next_leaf_map = leaf_map.get(hash);

                        if (next_leaf_map === undefined) {
                            next_leaf_map = new Map();
                            leaf_map.set(hash, next_leaf_map);
                        }

                        // Set it as the next leaf and iterate.
                        leaf_map = next_leaf_map;
                    });

                }

                var callbacks = leaf_map.get(callback_key);

                if (callbacks === undefined) {
                    callbacks = [];
                    leaf_map.set(callback_key, callbacks);
                }

                return callbacks;
            }

            /**
             * Invoke all registered callbacks and recursively traverse the hash list start at start_index in the hash list.
             * @member module:ParlaySocket.CallbackContainer#invoke_all_with_hashes
             * @private
             * @param {Object} topics - Object of key/value pairs.
             * @param {Object} contents - Object of key/value pairs.
             * @param {Array} hash_list -
             * @param {Number} start_index -
             * @param {Map} map - Tree-like structure that contains topic registrations.
             */
            function invoke_all_with_hashes (topics, contents, hash_list, start_index, map) {

                // If map is not given we are done with our traversal.
                if (map === undefined) {
                    return;
                }

                var callbacks = map.get(callback_key);

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
                    if (remaining_callbacks.length > 0) {
                        map.set(callback_key, remaining_callbacks);
                    }
                    else {
                        map.delete(callback_key);
                    }
                }

                // Now go down the list from start_index and try with that key.
                for (var i = start_index; i < hash_list.length; i++) {
                    invoke_all_with_hashes(topics, contents, hash_list, start_index + 1, map.get(hash_list[i]));
                }
            }

            /**
             * Adds callback registration for the given topics.
             * @member module:ParlaySocket.CallbackContainer#add
             * @public
             * @param {Object} topics - Object of key/value pairs.
             * @param {Function} callback - Called when message with matching topics is received.
             * @param {Boolean} persist - If true it will remain until explicitly deregistered otherwise, removed after one invocation.
             * @param {Boolean} verbose - If true both topics and contents are passed to callback, otherwise only contents.
             * @returns {Function} - Deregistration function, if called this registration will be removed.
             */
            function add (topics, callback, persist, verbose) {
                var callbacks = get_callbacks_for_topics(topics);

                callbacks.push({
                    func: callback,
                    persist: persist,
                    verbose: verbose
                });

                return function deregistrationFunction () {
                    container.remove(topics, callback);
                };
            }

            /**
             * Removes callback registration for the given topics and callback reference.
             * @member module:ParlaySocket.CallbackContainer#delete
             * @public
             * @param {Object} topics - Object of key/value pairs.
             * @param {Function} callback - Reference to registered callback function.
             * @returns {Boolean} - True if a registration was removed, false otherwise.
             */
            function remove (topics, callback) {
                var callbacks = get_callbacks_for_topics(topics);

                // Locate which index the given callback function is located in the callbacks Array.
                var index = callbacks.findIndex(function (callback_obj) {
                    return callback_obj.func === callback;
                });

                // If the callback exists in the array, splice it, prune unneeded topic tree branches and return true.
                // Otherwise return false if the callback doesn't exist in the array.
                if (index > -1) {
                    callbacks.splice(index, 1);
                    prune(internal_map);
                    return true;
                }
                else {
                    return false;
                }
            }

            /**
             * Calls all applicable callbacks for the given topics Object.
             * Will remove any invoked callback that is not persistent.
             * @member module:ParlaySocket.CallbackContainer#invoke
             * @public
             * @param {Object} topics - Object of key/value pairs.
             * @param {Object} contents - Object of key/value pairs.
             */
            function invoke (topics, contents) {

                // This will be the map that we encode (sorted so we're stable).
                var hash_list = Object.keys(topics).sort().map(function (key) {
                    return get_hash(key, topics[key]);
                });

                // Start at the root.
                invoke_all_with_hashes(topics, contents, hash_list, 0, internal_map);
            }

            /**
             * Returns number of unique topic keys.
             * @member module:ParlaySocket.CallbackContainer#size
             * @public
             * @param {Map} map - Tree-like structure that contains topic registrations.
             * @returns {Number} - Count of topics keys.
             */
            function size (map) {
                map = map || internal_map;

                // Access the callbacks at this depth.
                var callbacks = map.get(callback_key);

                // If we have anything in our callbacks then we count as 1 unique topic.
                var count = callbacks !== undefined && callbacks.length ? 1 : 0;

                // Recursively add our children up.
                map.forEach(function (value, key) {
                    if (key !== callback_key && value !== undefined) {
                        count += container.size(value);
                    }
                });

                return count;
            }

            /**
             * Returns number of registered callback functions.
             * @member module:ParlaySocket.CallbackContainer#callbackCount
             * @public
             * @param {Map} map - Tree-like structure that contains topic registrations.
             * @returns {Number} - Count of registered callback functions.
             */
            function callbackCount (map) {
                map = map || internal_map;
                var count = 0;

                // If we have anything in our callbacks then we count as n unique callbacks.
                if (map.get(callback_key) !== undefined) {
                    count += map.get(callback_key).length;
                }

                // Recursively add our children up.
                map.forEach(function (value, key) {
                    if (key !== callback_key && value !== undefined) {
                        count += container.callbackCount(value);
                    }
                });

                return count;
            }

            /**
             * Traverse the CallbackContainer tree to find the child at the maximum depth.
             * @member module:ParlaySocket.CallbackContainer#maxDepth
             * @public
             * @returns {Number}
             */
            function maxDepth () {

                function traverse(tree) {
                    var max_child_depth = 0;

                    // Iterate through the entries in the tree.
                    var iter = tree.entries();
                    for (var current = iter.next(); !current.done; current = iter.next()) {
                        if (current.value[0] !== callback_key && current.value[1].size !== 0) {
                            var current_depth = traverse(current.value[1]);

                            if (current_depth > max_child_depth) {
                                max_child_depth = current_depth;
                            }
                        }
                    }

                    return max_child_depth + 1;
                }

                return traverse(internal_map);
            }

        }

        return CallbackContainer;
    }

    ParlaySocketFactory.$inject = ['BrokerAddress', '$location', '$window','$q', 'CallbackContainer'];
    function ParlaySocketFactory (BrokerAddress, $location, $window, $q, CallbackContainer) {

        /**
         * [ParlaySocket]{@link module:ParlaySocket.ParlaySocket} specific Error type that is thrown on invalid messages.
         * @param {String} message - Error message that will be included when thrown.
         * @constructor module:ParlaySocket.ParlaySocketError
         */
        function ParlaySocketError (message) {
            TypeError.call(this, message);
            this.name = "ParlaySocketError";
        }

        // Prototypically inherit from base JavaScript TypeError class.
        ParlaySocketError.prototype = Object.create(TypeError.prototype);

        /**
         * [ParlaySocket]{@link module:ParlaySocket.ParlaySocket} specific
         * [ParlaySocketError]{@link module:ParlaySocket.ParlaySocketError} type that is thrown on invalid topics.
         * @param {String} type - Invalid type that was given.
         * @constructor module:ParlaySocket.TopicsError
         */
        function TopicsError (type) {
            ParlaySocketError.call(this, "Invalid type for topics, accepts Object but was type " + type + ".");
            this.name = "TopicsError";
        }

        // Prototypically inherit from ParlaySocketError class.
        TopicsError.prototype = Object.create(ParlaySocketError.prototype);

        /**
         * [ParlaySocket]{@link module:ParlaySocket.ParlaySocket} specific
         * [ParlaySocketError]{@link module:ParlaySocket.ParlaySocketError} type that is thrown on invalid contents.
         * @param {String} type - Invalid type that was given.
         * @constructor module:ParlaySocket.ContentsError
         */
        function ContentsError (type) {
            ParlaySocketError.call(this, "Invalid type for contents, accepts Object or undefined but was type " + type + ".");
            this.name = "ContentsError";
        }

        // Prototypically inherit from ParlaySocketError class.
        ContentsError.prototype = Object.create(ParlaySocketError.prototype);

        /**
         * ParlaySocket is a wrapper around the native
         * [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket}.
         * ParlaySocket will automatically connect to the Broker address specific in the Angular value BrokerAddress.
         * It provides convenience through registration of callbacks to specific topics and through
         * [Promise]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise} resolution.
         * @constructor module:ParlaySocket.ParlaySocket
         */
        function ParlaySocket () {

            /**
             * Container that manages topic to callback registrations.
             * @member module:ParlaySocket.ParlaySocket#onMessageCallbacks
             * @private
             * @type {Array}
             */
            var onMessageCallbacks = new CallbackContainer();

            /**
             * Callbacks that will be called on [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket} open.
             * @member module:ParlaySocket.ParlaySocket#onOpenCallbacks
             * @private
             * @type {Array}
             */
            var onOpenCallbacks = [];

            /**
             * Callbacks that will be called on [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket} close.
             * @member module:ParlaySocket.ParlaySocket#onCloseCallbacks
             * @private
             * @type {Array}
             */
            var onCloseCallbacks = [];

            /**
             * Queue that holds messages that were attempted to be send while
             * [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket} was closed.
             * @member module:ParlaySocket.ParlaySocket#sendQueue
             * @private
             * @type {Array}
             */
            var sendQueue = [];

            /**
             * Resolved on [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket} open. If
             * the [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket} fails to open it
             * will be rejected.
             * @member module:ParlaySocket.ParlaySocket#onOpenPromise
             * @private
             * @type {$q.deferred.Promise}
             */
            var onOpenPromise;

            /**
             * Resolved on clean [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket}
             * close. Rejected on unclean [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket}
             * close.
             * @member module:ParlaySocket.ParlaySocket#onClosePromise
             * @private
             * @type {$q.deferred.Promise}
             */
            var onClosePromise;

            /**
             * [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket}.
             * @member module:ParlaySocket.ParlaySocket#socket
             * @private
             * @type {WebSocket}
             */
            var socket;

            var parlay_socket = this;

            // Attach methods to ParlaySocket.
            parlay_socket.open = open;
            parlay_socket.close = close;
            parlay_socket.sendMessage = sendMessage;
            parlay_socket.onMessage = onMessage;
            parlay_socket.getAddress = getAddress;
            parlay_socket.onClose = onClose;
            parlay_socket.onOpen = onOpen;
            parlay_socket.isConnected = isConnected;

            // Opens ParlaySocket as soon as possible.
            // if we have an over-ridden Broker address, use that instead
            if($window.parlay_overrides !== undefined && $window.parlay_overrides.websocket_address !== undefined)
            {
                parlay_socket.open($window.parlay_overrides.websocket_address);

            }
            else {
                parlay_socket.open($location.protocol === 'https:' ? 'wss://' + BrokerAddress + ':8086' : 'ws://' + BrokerAddress + ':8085');
            }

            /**
             * Opens [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket} and returns
             * [Promise]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}
             * when complete.
             * @member module:ParlaySocket.ParlaySocket#open
             * @public
             * @param {String} url - Location the WebSocket instance should connect to.
             * @returns {$q.defer.promise} Resolved after WebSocket is opened.
             */
            function open (url) {
                if (typeof url !== "string") {
                    throw new ParlaySocketError("ParlaySocket.open(url) requires a url string.");
                }
                else if (parlay_socket.isConnected()) {
                    throw new ParlaySocketError("ParlaySocket open was called while the socket was already open.");
                }
                else {
                    onOpenPromise = $q.defer();
                    onClosePromise = $q.defer();
                    socket = new WebSocket(url);
                    // Attach event handlers.
                    socket.onopen = onOpenHandler;
                    socket.onclose = onCloseHandler;
                    socket.onmessage = onMessageHandler;
                }
                return onOpenPromise.promise;
            }

            /**
             * Closes [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket} and returns
             * [Promise]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise} when complete.
             * @public
             * @member module:ParlaySocket.ParlaySocket#close
             * @returns {$q.defer.promise} Resolved when WebSocket is closed.
             */
            function close (reason) {
                socket.close(reason);
                return onClosePromise.promise;
            }

            /**
             * Sends message to connected [PromenadeBroker]{@link module:PromenadeBroker.PromenadeBroker} over
             * [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket} with associated topics and contents.
             * Optionally registers a callback which will be called upon reply with matching topic signature.
             * @member module:ParlaySocket.ParlaySocket#sendMessage
             * @public
             * @param {Object} topics - Map of key/value pairs.
             * @param {Object} contents - Map of key/value pairs.
             * @param {Object} [response_topics] - Map of key/value pairs.
             * @param {Function} [response_callback] - Callback to invoke upon receipt of message matching response topics.
             * @param {Boolean} [verbose] - If true we should invoke callback with full message. If false or undefined invoke with only contents for simplicity.
             * @returns {$q.defer.Promise} Resolves once message has been passed to socket.
             */
            function sendMessage (topics, contents, response_topics, response_callback, verbose) {
                // If verbose is not passed default to false.
                verbose = (verbose || false);

                // Check if either response_topics or response_callbacks is defined.
                if (response_topics !== undefined || response_callback !== undefined) {
                    // If one is defined but the other is undefined throw and error.
                    if (response_topics === undefined || response_callback === undefined) {
                        throw new ParlaySocketError("If a response callback is desired both response topics and response callback must be defined.");
                    }
                    // Otherwise we should register a listener.
                    else {
                        onMessageCallbacks.add(response_topics, response_callback, false, verbose);
                    }
                }

                // Ensure that topics is an Object.
                if (typeof topics === 'object') {
                    // If contents is an Object send both topics and contents.
                    if (typeof contents === 'object') {
                        send(topics, contents);
                    }
                    // Otherwise throw error.
                    else {
                        throw new ContentsError(typeof contents);
                    }
                }
                // Otherwise throw error.
                else {
                    throw new TopicsError(typeof topics);
                }
            }

            /**
             * Registers a callback to be associated with topics. Callback is invoked when message is received over
             * [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket} from
             * [PromenadeBroker]{@link module:PromenadeBroker.PromenadeBroker} with matching signature.
             * @member module:ParlaySocket.ParlaySocket#onMessage
             * @public
             * @param {Object} topics - Map of key/value pairs.
             * @param {Function} callback - Callback to invoke upon receipt of message matching response topics.
             * @param {Boolean} verbose - If true we should invoke callback with full message. If false or undefined invoke with only contents for simplicity.
             * @returns {Function} Deregistration function for this message listener.
             */
            function onMessage (topics, callback, verbose) {
                // Ensure that topics is an Object.
                if (typeof topics === 'object') {
                    return onMessageCallbacks.add(topics, callback, true, !!verbose);
                }
                // Otherwise throw an error.
                else {
                    throw new TopicsError(typeof topics);
                }
            }

            /**
             * Checks if [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket} is open.
             * @member module:ParlaySocket.ParlaySocket#isConnected
             * @public
             * @returns {Boolean} - True if WebSocket is open, false otherwise.
             */
            function isConnected () {
                return socket !== undefined && socket.readyState === socket.OPEN;
            }

            /**
             * Returns the URL where the WebSocket is connected.
             * @member module:ParlaySocket.ParlaySocket#getAddress
             * @public
             * @returns {String} - URL.
             */
            function getAddress () {
                return socket.url;
            }

            /**
             * Registers a callback which will be invoked on socket close.
             * @member module:ParlaySocket.ParlaySocket#onClose
             * @public
             * @param {Function} callbackFunc - Callback function which will be invoked on WebSocket close.
             */
            function onClose (callbackFunc) {
                onCloseCallbacks.push(callbackFunc);
            }

            /**
             * Registers a callback which will be invoked on socket open.
             * @member module:ParlaySocket.ParlaySocket#onOpen
             * @public
             * @param {Function} callbackFunc - Callback function which will be invoked on WebSocket open.
             */
            function onOpen(callbackFunc) {
                onOpenCallbacks.push(callbackFunc);
            }

            /**
             * Attempts to send message containing topics and contents on the
             * [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket}.
             * @member module:ParlaySocket.ParlaySocket#send
             * @public
             * @param {Object} topics
             * @param {Object} contents
             * @returns {$q.defer.Promise} - Resolved if send completed without exception, rejected otherwise.
             */
            function send (topics, contents) {
                // Stringify the message Object before sending.
                var message = JSON.stringify({TOPICS: topics, CONTENTS: contents});

                // If socket is open send messages normally.
                if (socket.readyState === socket.OPEN) {
                    socket.send(message);
                }
                // Otherwise queue them until the socket opens.
                else {
                    sendQueue.push(message);
                }
            }

            /**
             * Attempt to send all messages that were queued while the socket was closed.
             * @member module:ParlaySocket.ParlaySocket#processSendQueue
             * @public
             */
            function processSendQueue () {
                sendQueue.forEach(function (message) {
                    socket.send(message);
                });
                sendQueue = [];
            }

            /**
             * Invokes callbacks associated with the topics, passes contents as parameters.
             * If the callback is not persistent it will be removed after invocation.
             * @member module:ParlaySocket.ParlaySocket#invokeCallbacks
             * @public
             * @param {Object} topics - Map of key/value pairs.
             * @param {Object} contents - Map of key/value pairs.
             * As this function is called per message received and the topics may result in a high number of combinations,
             * this could potentially cause slowdown.
             */
            function invokeCallbacks (topics, contents) {
                onMessageCallbacks.invoke(topics, contents);
            }

            /**
             * Called when [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket} is opened.
             * @member module:ParlaySocket.ParlaySocket#onOpenHandler
             * @public
             * @param {MessageEvent} event - Event generated by the WebSocket on open.
             */
            function onOpenHandler (event) {
                // If the onOpenPromise exists we should resolve it.
                if (onOpenPromise !== undefined) {
                    onOpenPromise.resolve();
                    onOpenPromise = undefined;
                }

                // Send any messages that have been queued for sending before the socket had been opened.
                processSendQueue();

                // Process each onOpenCallback
                onOpenCallbacks.forEach(function (callback) {
                    callback(event);
                });
            }

            /**
             * Called when [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket} is closed.
             * @member module:ParlaySocket.ParlaySocket#onCloseHandler
             * @public
             * @param {MessageEvent} event - Event generated by the WebSocket on close.
             */
            function onCloseHandler (event) {
                // If the close event was clean, we should resolve the promise.
                if (event.wasClean) {
                    onClosePromise.resolve(event.reason);
                }
                // Otherwise our connection was severed and we should reject.
                else {
                    onClosePromise.reject(event.reason);
                }

                // If a onOpenPromise exists that hasn't been resolved we should reject it now.
                if (onOpenPromise !== undefined) {
                    onOpenPromise.reject();
                    onOpenPromise = undefined;
                }

                // Clear any messages that were pending in the sendQueue as they aren't relevant after a socket close.
                sendQueue = [];

                // Process each onCloseCallback
                onCloseCallbacks.forEach(function (callback) {
                    callback(event);
                });
            }

            /**
             * Called on receipt of a message on the
             * [HTML WebSocket]{@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket}.
             * @member module:ParlaySocket.ParlaySocket#onMessageHandler
             * @public
             * @param {MessageEvent} event - Event generated by the WebSocket containing message contents.
             */
            function onMessageHandler (event) {
                var message = JSON.parse(event.data);
                invokeCallbacks(message.TOPICS, message.CONTENTS);
            }

        }

        return new ParlaySocket();
    }

}());
