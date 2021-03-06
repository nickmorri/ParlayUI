(function () {
    "use strict";

    /**
     * @module PromenadeBroker
     */

    var module_dependencies = ["parlay.socket", "parlay.notification", "parlay.utility",
        "parlay.notification.error", "parlay.settings", "promenade.items.standarditem",
        "promenade.protocols.directmessage", "ngMaterial", "parlay.widget.manager"];

    angular.module("promenade.broker", module_dependencies)
        .run(PromenadeBrokerRun)
        .factory("PromenadeBroker", PromenadeBrokerFactory);

    PromenadeBrokerRun.$inject = ["ParlaySettings"];
    function PromenadeBrokerRun (ParlaySettings) {
        ParlaySettings.registerDefault("broker", {show_prompt: false, auto_discovery: true});
        if (!ParlaySettings.has("broker")) {
            ParlaySettings.restoreDefault("broker");
        }
    }

    PromenadeBrokerFactory.$inject = ["ParlaySocket", "BrokerAddress", "ParlayNotification", "ParlayErrorDialog",
        "ParlaySettings", "PromenadeStandardItem", "PromenadeDirectMessageProtocol", "$q", "$location", "$timeout", "$window",
        "$mdDialog", "ParlayObject", "ParlayWidgetManager"];
    function PromenadeBrokerFactory (ParlaySocket, BrokerAddress, ParlayNotification, ParlayErrorDialog, ParlaySettings,
                                     PromenadeStandardItem, PromenadeDirectMessageProtocol, $q, $location, $timeout, $window,
                                     $mdDialog, ParlayObject, ParlayWidgetManager) {

        /**
         * The PromenadeBroker is a implementation of a Broker that communicates using the Parlay communication
         * publish/subscribe model.
         *
         * @constructor module:PromenadeBroker.PromenadeBroker
         */
        function PromenadeBroker() {

            var broker = this;
            /**
             * List of all items
             * @member module:PromenadeBroker.PromenadeBroker#items
             * @type {Array}
             */
            broker.items = [];

            broker.default_item_factory = PromenadeStandardItem;
            broker.default_protocol = new PromenadeDirectMessageProtocol({NAME: "UIDummyProtocol", type:"Local"});
            //it's Open
            broker.default_protocol.onOpen();

            broker.addItem = function(data)
            {
                //don't add the broker or items without IDs
                if(data !== {} && data.TEMPLATE !== "Broker")
                {
                    broker.items.push(new broker.default_item_factory(data, broker.default_protocol));
                }
            };

            /**
             * True if the there has been a previously successful connection, false otherwise.
             * @member module:PromenadeBroker.PromenadeBroker#connected_previously
             * @private
             * @type {Boolean}
             */
            var connected_previously = false;

            /**
             * Cached copy of the most recent discovery Object received from the PromenadeBroker.
             * @member module:PromenadeBroker.PromenadeBroker#last_discovery
             * @private
             * @type {Object}
             */
            var last_discovery;

            /**
             * Container for registered on_discovery callbacks.
             * @member module:PromenadeBroker.PromenadeBroker#on_discovery_callbacks
             * @private
             * @type {Array}
             */
            var on_discovery_callbacks = [];

            /**
             * True if the [ParlaySocket]{@link module:ParlaySocket.ParlaySocket} is connected, false otherwise.
             * @member module:PromenadeBroker.PromenadeBroker#connected
             * @private
             * @type {Boolean}
             */
            Object.defineProperty(broker, "connected", {
                get: function () {
                    return ParlaySocket.isConnected();
                }
            });

            // Attach methods to the PromenadeBroker.
            broker.connect = connect;
            broker.disconnect = disconnect;
            broker.sendMessage = sendMessage;
            broker.onMessage = onMessage;
            broker.onDiscovery = onDiscovery;
            broker.onOpen = onOpen;
            broker.onClose = onClose;
            broker.requestShutdown = requestShutdown;
            broker.requestDiscovery = requestDiscovery;
            broker.requestAvailableProtocols = requestAvailableProtocols;
            broker.requestOpenProtocols = requestOpenProtocols;
            broker.openProtocol = openProtocol;
            broker.closeProtocol = closeProtocol;
            broker.invokeDiscoveryCallbacks = invokeDiscoveryCallbacks;
            broker.hasConnectedPreviously = hasConnectedPreviously;
            broker.setConnectedPreviously = setConnectedPreviously;
            broker.getLastDiscovery = getLastDiscovery;
            broker.applySavedDiscovery = applySavedDiscovery;
            broker.getBrokerAddress = getBrokerAddress;
            broker.getLogs = getLogs;

            // Register a callback on get_discovery_response. Call all registered discovery callbacks.
            broker.onMessage({"response": "get_discovery_response"}, function (response) {
                broker.invokeDiscoveryCallbacks(response);
            });

            // Register a callback on MSG_STATUS == 'ERROR' so that we can display a dialog.
            broker.onMessage({"MSG_STATUS": "ERROR"}, function (response) {
                ParlayErrorDialog.show(response.TOPICS.FROM, response.CONTENTS.DESCRIPTION, response);
            }, true);

            // Register a callback on MSG_STATUS == 'WARNING' so that we can display a dialog.
            broker.onMessage({"MSG_STATUS": "WARNING"}, function (response) {
                ParlayNotification.show({content: response, warning: true});
            });

            broker.onMessage({"MSG_TYPE": "EVENT"}, function (response) {
                if (response.EVENT === "ParlaySendFileEvent") {
                    var file = new ParlayObject(response.INFO);
                    file.download(response.DESCRIPTION, false);
                }
            });

            // Register PromenadeBroker's notification callback for discovery.
            broker.onDiscovery(function (contents) {

                // Store latest discovery data.
                last_discovery = contents.discovery;

                // Build the contents of the notification to display.
                var content_string;

                if (contents.discovery.length === 1) {
                    content_string = "Discovered " + contents.discovery[0].NAME + ".";
                }
                else if (contents.discovery.length > 1) {
                    content_string = "Discovered " + contents.discovery.length + " protocols.";
                }
                else {
                    content_string = "Discovered 0 protocols. Verify connections.";
                }

                ParlayNotification.show({content: content_string});

                if (contents.discovery && contents.discovery.length > 0) {
                    // Record the current Broker version.

                    var broker_discovery = contents.discovery.find(function (item) {
                        return item.NAME && item.NAME === "Broker";
                    });

                    if (broker_discovery !== undefined) {
                        broker.version = broker_discovery.VERSION;
                    }

                }

                var autosave = ParlayWidgetManager.getAutosave();
                if (!!autosave && ParlayWidgetManager.hasActiveWidgets())
                    ParlayWidgetManager.loadEntry(autosave);
            });

            // Actions that PromenadeBroker needs to perform on ParlaySocket open.
            broker.onOpen(function () {
                // Request a subscription from the Broker for this protocol.
                ParlaySocket.sendMessage({"type": "subscribe"}, {"TOPICS": {"TO": 61953}});
                ParlaySocket.sendMessage({"type": "subscribe"}, {"TOPICS": {"TO": "UI"}});
                ParlaySocket.sendMessage({"type": "subscribe"}, {"TOPICS": {"TX_TYPE": "BROADCAST"}});

                broker.setConnectedPreviously();

                ParlayNotification.show({content: "Connected to Parlay Connect!"});

                // Wait for Broker's discovery request and respond with a empty discovery message.
                broker.onMessage({'type': "get_protocol_discovery"}, function() {
                    ParlaySocket.sendMessage({type: "get_protocol_discovery_response"}, {discovery: {}});
                });

                // Request a fast discovery to see if there's already one there if that is the user preference.
                /* istanbul ignore else */
                if (ParlaySettings.get("broker").auto_discovery) {
                    broker.requestDiscovery(false);
                    ParlayWidgetManager.loadEntryByName($location.search().workspace);
                }

            });

            // Actions that PromenadeBroker needs to perform on ParlaySocket close.
            broker.onClose(function () {
                // When socket is closed we should show a notification giving the user the option to reconnect.
                // If socket failed to open we should show a notification giving the user the option to connect.
                connectNotification();
            });

            /**
             * Before allowing window unload, prompt the user to ensure that they don't want to first shutdown the Broker.
             * @param {Event} event - DOM Event generated by window unload.
             * @returns {String|null} - Text shown to end-user in a modal if we want them to confirm window close, null
             * if window can be shown without confirmation.
             */
            function unload_listener (event) {
                var confirmation;

                // If the Broker is currently connected we want to prompt the user to shutdown the Broker.
                if (broker.connected && ParlaySettings.get("broker").show_prompt) {
                    confirmation = "Closing browser will not shut the Broker down. Are you sure you want to leave the page?";
                }
                // Otherwise we can just allow the browser windows to close.
                else {
                    return null;
                }

                (event || $window.event).returnValue = confirmation;

                // Ensure that a dialog is spawned if the user decides to remain on the page.
                $timeout(function() {
                    var confirm = $mdDialog.confirm()
                        .title('Would you like to shutdown the Broker?')
                        .textContent('Navigating away or closing this webpage will not automatically shut the Broker down. ')
                        .ok('Shut Broker down and close browser tab')
                        .cancel('Dismiss');
                    $mdDialog.show(confirm).then(function() {
                        // Request the Broker shutdown and close the window.
                        broker.requestShutdown().then(function () {
                            $window.removeEventListener("beforeunload", unload_listener);
                            $window.close();
                        });
                    });
                }, 500);

                return confirmation;
            }

            // Register the beforeunload listener on the window.
            $window.addEventListener("beforeunload", unload_listener);

            /**
             * Registers a callback which will be invoked on socket open.
             * @member module:PromenadeBroker.PromenadeBroker#onOpen
             * @public
             * @param {Function} callbackFunc - Callback function which will be invoked on
             * [ParlaySocket]{@link module:ParlaySocket.ParlaySocket} open.
             */
            function onOpen (callbackFunc) {
                ParlaySocket.onOpen(callbackFunc);
            }

            /**
             * Registers a callback which will be invoked on socket close.
             * @member module:PromenadeBroker.PromenadeBroker#onClose
             * @public
             * @param {Function} callbackFunc - Callback function which will be invoked on
             * [ParlaySocket]{@link module:ParlaySocket.ParlaySocket} close.
             */
            function onClose (callbackFunc) {
                ParlaySocket.onClose(callbackFunc);
            }

            /**
             * Returns the URL where the [ParlaySocket]{@link module:ParlaySocket.ParlaySocket} is connected.
             * @member module:PromenadeBroker.PromenadeBroker#getBrokerAddress
             * @public
             * @returns {String} - URL.
             */
            function getBrokerAddress () {
                return ParlaySocket.getAddress();
            }

            /**
             * Closes [ParlaySocket]{@link module:ParlaySocket.ParlaySocket} and returns Promise when complete.
             * @member module:PromenadeBroker.PromenadeBroker#disconnect
             * @public
             * @returns {$q.defer.promise} Resolved when [ParlaySocket]{@link module:ParlaySocket.ParlaySocket} is closed.
             */
            function disconnect (reason) {
                return ParlaySocket.close(reason);
            }

            /**
             * Requests [ParlaySocket]{@link module:ParlaySocket.ParlaySocket} to open a new connection.
             * @member module:PromenadeBroker.PromenadeBroker#connect
             * @public
			 */
			function connect () {
                if($window.parlay_overrides !== undefined && $window.parlay_overrides.websocket_address !== undefined)
                {
                    ParlaySocket.open($window.parlay_overrides.websocket_address);

                }
                else {
                    ParlaySocket.open($location.protocol === 'https:' ? 'wss://' + BrokerAddress + ':8086' : 'ws://' + BrokerAddress + ':8085');
                }
			}

            /**
             * Registers a callback on discovery.
             * @member module:PromenadeBroker.PromenadeBroker#onDiscovery
             * @public
             * @param {Function} callbackFunc - Callback function to be called on message receipt.
             */
            function onDiscovery (callbackFunc) {
                on_discovery_callbacks.push(callbackFunc);
            }

            /**
             * Call all callbacks registered onDiscovery with the given discovery Object.
             * @member module:PromenadeBroker.PromenadeBroker#invokeDiscoveryCallbacks
             * @public
             * @param {Object} discovery - Object that contains discovery information.
             * @returns {Number} - Count of callbacks invoked.
             */
            function invokeDiscoveryCallbacks (discovery) {
                on_discovery_callbacks.forEach(function (callback) {
                    callback(discovery);
                });
                return on_discovery_callbacks.length;
            }

            /**
             * Checks if we have connected successfully in the past.
             * @member module:PromenadeBroker.PromenadeBroker#hasConnectedPreviously
             * @public
             * @returns {Boolean} - True if we have connected successfully, false otherwise.
             */
            function hasConnectedPreviously () {
                return connected_previously;
            }

            /**
             * Sets our previous connection status to true.
             * @member module:PromenadeBroker.PromenadeBroker#setConnectedPreviously
             * @public
             */
            function setConnectedPreviously () {
                connected_previously = true;
            }

            /**
             * Retrieves latest private discovery data.
             * @member module:PromenadeBroker.PromenadeBroker#getLastDiscovery
             * @public
             * @returns {Object} - Latest discovery data object
             */
            function getLastDiscovery () {
                return last_discovery;
            }

            /**
             * Invoke the registered on_discovery callbacks with the given Object of saved discovery data.
             * @member module:PromenadeBroker.PromenadeBroker#applySavedDiscovery
             * @public
             * @param {Object} data - previously saved discovery Object.
             */
            function applySavedDiscovery (data) {
                broker.invokeDiscoveryCallbacks({discovery: data});
            }

            /**
             * Sends message to the Broker adding relevant topic fields.
             * @member module:PromenadeBroker.PromenadeBroker#sendMessage
             * @public
             * @param {Object} topics - Map of key/value topic pairs.
             * @param {Object} contents - Map of key/value content pairs.
             * @param {Object} response_topics - Map of key/value response topic pairs.
             * @returns {$q.defer.promise} Resolve when response is received.
             */
            function sendMessage (topics, contents, response_topics) {
                topics.type = "broker";
                response_topics.type = "broker";

                return $q(function (resolve) {
                    ParlaySocket.sendMessage(topics, contents, response_topics, resolve);
                });
            }

            /**
             * Listens for message with relevant response topics from Broker.
             * @member module:PromenadeBroker.PromenadeBroker#onMessage
             * @public
             * @param {Object} response_topics - Map of key/value response topic pairs.
             * @param {Function} response_callback - Function callback to be called on message receipt.
             * @param {Boolean} verbose - If true we should invoke callback with full message. If false or undefined invoke with only contents for simplicity.
             * @returns {Function} - Listener deregistration.
             */
            function onMessage (response_topics, response_callback, verbose) {
                return ParlaySocket.onMessage(response_topics, response_callback, verbose);
            }

            /**
             * Request the Broker shutdown.
             * @member module:PromenadeBroker.PromenadeBroker#requestShutdown
             * @public
             * @returns {$q.defer.promise} Resolve when response is received shutdown result.
             */
            function requestShutdown () {
                return broker.sendMessage({request: "shutdown"}, {}, {response: "shutdown_response"});
            }

            /**
             * Request the Broker for a discovery.
             * @member module:PromenadeBroker.PromenadeBroker#requestDiscovery
             * @public
             * @param {Boolean} is_forced - Force cached invalidation.
             * @returns {$q.defer.promise} Resolve when response is received with available items.
             */
            function requestDiscovery (is_forced) {

                ParlayWidgetManager.autoSave();

                // Check we are connected first, otherwise display ParlayNotification.
                if (broker.connected) {

                    // $q Deferred that will be resolved upon discovery response.
                    var deferred = $q.defer();

                    // Wait before displaying the discovery progress notification in case of a quick discovery response.
                    var registration = $timeout(function () {
                        // Show progress and pass deferred so that we can hide dialog when it is resolved.
                        ParlayNotification.showProgress(deferred);
                    }, 500);


                    return $q.all([broker.requestAvailableProtocols(), broker.requestOpenProtocols()]).then(function () {
                        return broker.sendMessage({request: "get_discovery"}, {"force": !!is_forced}, {response: "get_discovery_response"}).then(function (response) {
                            // Resolve deferred so that dialog can be hidden once response is received.
                            deferred.resolve(response);

                            // Prevent the dialog from displaying if we receive a quick discovery response.
                            $timeout.cancel(registration);
                            return response;
                        });
                    });
                }
                else {
                    ParlayNotification.show({content: "Cannot discover while not connected to Parlay Connect."});
                    connectNotification();
                    return $q(function (resolve, reject) { reject("Cannot discover while not connected to Parlay Connect."); });
                }
            }

            /**
             * Requests available protocols for connection from the Broker.
             * @member module:PromenadeBroker.PromenadeBroker#requestAvailableProtocols
             * @public
             * @returns {$q.defer.promise} Resolved with available protocols.
             */
            function requestAvailableProtocols () {
                return broker.sendMessage({request: "get_protocols"}, {}, {response: "get_protocols_response"});
            }

            /**
             * Requests open protocols for connection from the Broker.
             * @member module:PromenadeBroker.PromenadeBroker#requestOpenProtocols
             * @public
             * @returns {$q.defer.promise} Resolved with open protocols.
             */
            function requestOpenProtocols () {
                return broker.sendMessage({request: "get_open_protocols"}, {}, {response: "get_open_protocols_response"}).then(function (response) {
                    return response.status === "ok" ? $q.resolve(response.protocols) : $q.reject(response);
                });
            }

            /**
             * Opens protocol.
             * @member module:PromenadeBroker.PromenadeBroker#openProtocol
             * @public
             * @param {Object} configuration - Configuration object we should configure a new protocol connection with.
             * @returns {$q.defer.promise} Resolve when response is received with result of open request from Broker.
             */
            function openProtocol (configuration) {
                return broker.sendMessage({request: "open_protocol"}, {"protocol_name": configuration.name, "params": configuration.parameters}, {response: "open_protocol_response"}).then(function (response) {
                    return response.STATUS.toLowerCase().indexOf("error") === -1 ? $q.resolve(response) : $q.reject(response.STATUS);
                });
            }

            /**
             * Closes protocol.
             * @member module:PromenadeBroker.PromenadeBroker#closeProtocol
             * @public
             * @param {String} protocol_name - Name of an open protocol.
             * @returns {$q.defer.promise} Resolve when response is received with result of close request from Broker.
             */
            function closeProtocol (protocol_name) {
                return broker.sendMessage({request: "close_protocol"}, {"protocol": protocol_name}, {response: "close_protocol_response"}).then(function (response) {
                    return response.STATUS === "ok" ? $q.resolve(response) : $q.reject(response.STATUS);
                });
            }

            function connectNotification() {
                ParlayNotification.show(broker.hasConnectedPreviously() ? {
                        content: "Disconnected from Parlay Connect!",
                        action: {
                            text: "Reconnect",
                            callback: broker.connect
                        },
                        permanent: true,
                        warning: true
                    } : {
                        content: "Failed to connect to Parlay Connect!",
                        action: {
                            text: "Connect",
                            callback: broker.connect
                        },
                        permanent: true,
                        warning: true
                    }
                );
            }

            function getLogs() {
                return broker.default_protocol.getLog();
            }

        }

        return new PromenadeBroker();
    }

}());
