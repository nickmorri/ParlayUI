(function () {
    "use strict";

    var module_dependencies = ["promenade.broker", "promenade.protocols.directmessage", "parlay.notification", "parlay.settings"];

    angular
        .module("parlay.protocols.manager", module_dependencies)
        .factory("ParlayProtocolManager", ParlayProtocolManagerFactory);

    ParlayProtocolManagerFactory.$inject = ["$injector", "$q", "PromenadeBroker", "ParlayStore", "ParlayNotification"];
    function ParlayProtocolManagerFactory($injector, $q, PromenadeBroker, ParlayStore, ParlayNotification) {

        /**
         * Holds references to available, open and saved [ParlayProtocol]{@link module:ParlayProtocol.ParlayProtocol} connections and configurations.
         * Manages opening and closing of these protocols.
         * @constructor module:ParlayProtocol.ParlayProtocolManager
         */
        function ParlayProtocolManager() {

            /**
             * Reference to [ParlayStore]{@link module:ParlayStore.ParlayStore} protocols namespace,
             * @member module:ParlayProtocol.ParlayProtocolManager#store
             * @private
             * @type {ParlayStore}
             */
            var store = ParlayStore("protocols");

            /**
             * Holds [ParlayProtocol]{@link module:ParlayProtocol.ParlayProtocol}s that are open.
             * @member module:ParlayProtocol.ParlayProtocolManager#open_protocols
             * @private
             * @type {Array}
             */
            var open_protocols = [];

            /**
             * Holds [ParlayProtocol]{@link module:ParlayProtocol.ParlayProtocol}s that are available.
             * @member module:ParlayProtocol.ParlayProtocolManager#available_protocols
             * @private
             * @type {Array}
             */
            var available_protocols = [];

            /**
             * Holds [ParlayProtocol]{@link module:ParlayProtocol.ParlayProtocol}s that are saved.
             * @member module:ParlayProtocol.ParlayProtocolManager#saved_protocols
             * @private
             * @type {Array}
             */
            var saved_protocols = [];

            /**
             * Requests the [PromenadeBroker]{@link module:PromenadeBroker.PromenadeBroker} to close a protocol.
             * @member module:ParlayProtocol.ParlayProtocolManager#closeProtocol
             * @public
             * @param {Object} protocol - The protocol to be closed
             * @returns {$q.defer.promise} Resolved when the Broker responds with the close result.
             */
            this.closeProtocol = function (protocol) {
                return PromenadeBroker.closeProtocol(protocol.getName()).then(function (response) {
                    // Search for open protocol requested to be closed.
                    var index = open_protocols.findIndex(function (candidate) {
                        return protocol.getName() === candidate.getName();
                    });

                    // Remove if we find the protocol, then call it"s onClose method.
                    /* istanbul ignore else */
                    if (index > -1) {
                        open_protocols.splice(index, 1)[0].onClose();
                    }

                    ParlayNotification.show({content: "Closed " + protocol.getName() + "."});

                    return response;
                }).catch(function (status) {
                    ParlayNotification.show({content: status});
                    return $q.reject(status);
                });
            };

            /**
             * Requests the [PromenadeBroker]{@link module:PromenadeBroker.PromenadeBroker} to open a protocol.
             * Saves the configuration in [ParlayStore]{@link module:ParlayStore.ParlayStore} for later ease of use.
             * @member module:ParlayProtocol.ParlayProtocolManager#openProtocol
             * @public
             * @param {Object} configuration - Contains protocol configuration parameters.
             * @returns {$q.defer.promise} - Resolved when the Broker responds with the open result.
             */
            this.openProtocol = function (configuration) {
                return PromenadeBroker.openProtocol(configuration).then(function (response) {
                    saveProtocolConfiguration(configuration);
                    /* istanbul ignore next */
                    ParlayNotification.show({
                        content: "Connected to " + response.name + ".",
                        action: {
                            text: "Discover",
                            callback: function () { PromenadeBroker.requestDiscovery(true); }
                        }
                    });
                    return response;
                }.bind(this)).catch(function (status) {
                    ParlayNotification.show({content: status});
                    return $q.reject(status);
                });
            };

            /**
             * Delete the protocol configuration in the [ParlayStore]{@link module:ParlayStore.ParlayStore}.
             * @member module:ParlayProtocol.ParlayProtocolManager#deleteProtocolConfiguration
             * @public
             * @param {Object} configuration - Protocol configuration that we are removing from the ParlayStore.
             */
            this.deleteProtocolConfiguration = function (configuration) {
                var protocols = store.get("saved");
                if (!!protocols) {
                    delete protocols[configuration.name];

                    store.set("saved", protocols);
                    setSavedProtocols();
                }
            };

            /**
             * True if protocols are available, false otherwise.
             * @member module:ParlayProtocol.ParlayProtocolManager#hasAvailableProtocols
             * @public
             * @returns {Boolean}
             */
            this.hasAvailableProtocols = function () {
                return this.getAvailableProtocols().length > 0;
            };

            /**
             * Returns cached available protocols.
             * @member module:ParlayProtocol.ParlayProtocolManager#getAvailableProtocols
             * @public
             * @returns {Array} - available protocols.
             */
            this.getAvailableProtocols = function() {
                return available_protocols;
            };

            /**
             * True if protocols are open, false otherwise.
             * @member module:ParlayProtocol.ParlayProtocolManager#hasOpenProtocols
             * @public
             * @returns {Boolean}
             */
            this.hasOpenProtocols = function () {
                return this.getOpenProtocols().length > 0;
            };

            /**
             * Returns open protocols.
             * @member module:ParlayProtocol.ParlayProtocolManager#getOpenProtocols
             * @public
             * @returns {Array} - open protocols.
             */
            this.getOpenProtocols = function () {
                return open_protocols;
            };

            /**
             * True if protocols are saved, false otherwise.
             * @member module:ParlayProtocol.ParlayProtocolManager#hasSavedProtocols
             * @public
             * @returns {Array} - saved protocols.
             */
            this.hasSavedProtocols = function () {
                return this.getSavedProtocols().length > 0;
            };

            /**
             * Returns saved protocol configurations that are available and not currently connected.
             * @member module:ParlayProtocol.ParlayProtocolManager#getSavedProtocols
             * @public
             * @returns {Array} - Array of protocol configurations.
             */
            this.getSavedProtocols = function () {
                return saved_protocols.filter(checkSavedConfiguration);
            };

            /**
             * Clears open and available protocols.
             * @member module:ParlayProtocol.ParlayProtocolManager#clearProtocols
             * @private
             */
            function clearProtocols () {
                open_protocols.forEach(function (protocol) {
                    protocol.onClose();
                });
                open_protocols = [];
                available_protocols = [];
            }

            /**
             * Requests both available and open protocols.
             * @member module:ParlayProtocol.ParlayProtocolManager#requestProtocols
             * @private
             * @returns {$q.defer.promise} - Resolved when both request responses are received.
             */
            function requestProtocols () {
                return $q.all([requestAvailableProtocols(), requestOpenProtocols()]);
            }

            /**
             * Requests available protocols.
             * @member module:ParlayProtocol.ParlayProtocolManager#requestAvailableProtocols
             * @private
             * @returns {$q.defer.promise} - Resolved when request response is received.
             */
            function requestAvailableProtocols () {
                return PromenadeBroker.requestAvailableProtocols();
            }

            /**
             * Requests open protocols.
             * @member module:ParlayProtocol.ParlayProtocolManager#requestOpenProtocols
             * @private
             * @returns {$q.defer.promise} - Resolved when request response is received.
             */
            function requestOpenProtocols () {
                return PromenadeBroker.requestOpenProtocols();
            }

            /**
             * Return a open protocol with the given name.
             * @member module:ParlayProtocol.ParlayProtocolManager#getOpenProtocol
             * @private
             * @returns {Object} - Returns Protocol object.
             */
            function getOpenProtocol (name) {
                return open_protocols.find(function (protocol) {
                    return name === protocol.getName();
                });
            }

            /**
             * Sets private attribute available to an Array of available protocols.
             * @member module:ParlayProtocol.ParlayProtocolManager#setAvailableProtocols
             * @private
             * @param {Object} protocols - Map of protocol names : protocol details.
             */
            function setAvailableProtocols (protocols) {
                available_protocols = Object.keys(protocols).map(function (protocol_name) {
                    return {
                        name: protocol_name,
                        parameters: protocols[protocol_name].params.reduce(function (param_obj, current_param) {
                            param_obj[current_param] = {
                                value: null,
                                defaults: protocols[protocol_name].defaults[current_param]
                            };
                            return param_obj;
                        }, {})
                    };
                });
            }

            /**
             * Instantiates and opens the given Array of protocol configurations.
             * @member module:ParlayProtocol.ParlayProtocolManager#setOpenProtocols
             * @private
             * @param {Object} response - Contains Array of open protocols.
             */
            function setOpenProtocols (response) {

                /**
                 * Construct and instantiate a protocol with the given configuration.
                 * If the given protocol type is not available in system default to
                 * [PromenadeDirectMessageProtocol]{@link module:PromenadeDirectMessage.PromenadeDirectMessage}.
                 * @member module:ParlayProtocol.ParlayProtocolManager#constructProtocol
                 * @private
                 * @param {Object} configuration - Protocol configuration information.
                 */
                function constructProtocol (configuration) {
                    var Constructor = $injector.has(configuration.protocol_type) ?
                        $injector.get(configuration.protocol_type) : $injector.get("PromenadeDirectMessageProtocol");

                    var instance = new Constructor(configuration);
                    instance.onOpen();
                    return instance;
                }

                open_protocols = response.protocols.map(constructProtocol);
            }

            /**
             * Checks to see if a protocol given protocol is available but not currently open.
             * @member module:ParlayProtocol.ParlayProtocolManager#checkSavedConfiguration
             * @private
             * @param {Object} configuration - Object containing protocol configuration details.
             * @returns {Boolean} - True if protocol is available and not currently open.
             */
            function checkSavedConfiguration (configuration) {
                return available_protocols.some(function (protocol) {
                    return configuration.name === protocol.name;
                }) && !open_protocols.some(function (protocol) {
                    return Object.keys(configuration.parameters).map(function (key) {
                        return configuration.parameters[key];
                    }).some(function (value) {
                        return protocol.protocol_name.indexOf(value) !== -1;
                    });
                });
            }

            /**
             * Sets the saved_protocols Array if a protocol is available.
             * @member module:ParlayProtocol.ParlayProtocolManager#setSavedProtocols
             * @private
             */
            function setSavedProtocols () {
                var saved_configurations = store.get("saved");

                if (!!saved_configurations) {
                    // Only show saved configurations that are currently available but not connected.
                    saved_protocols = Object.keys(saved_configurations).map(function (key) {
                        return saved_configurations[key];
                    });
                }
            }

            /**
             * Adds information from discovery to open Protocol instance.
             * @member module:ParlayProtocol.ParlayProtocolManager#addDiscoveryInfoToOpenProtocol
             * @private
             * @param {Object} info - Discovery information which may be vendor specific.
             */
            function addDiscoveryInfoToOpenProtocol (info) {
                var protocol = getOpenProtocol(info.NAME);
                var protocolless_items = [];
                if (!!protocol) {
                    protocol.addDiscoveryInfo(info);
                }
                else {
                    PromenadeBroker.addItem(info);
                }
            }

            /**
             * Save the protocol configuration in the [ParlayStore]{@link module:ParlayStore.ParlayStore}.
             * @member module:ParlayProtocol.ParlayProtocolManager#saveProtocolConfiguration
             * @private
             * @param {Object} configuration - Protocol configuration that can be sent to the Broker.
             */
            function saveProtocolConfiguration (configuration) {

                var protocols = (store.get("saved") || {});

                configuration.last_connected = new Date();

                protocols[configuration.name] = configuration;

                store.set("saved", protocols);
                setSavedProtocols();
            }

            // PromenadeBroker callback registrations.

            PromenadeBroker.onOpen(requestProtocols);

            PromenadeBroker.onClose(clearProtocols);

            PromenadeBroker.onMessage({type: "broker", response: "open_protocol_response"}, requestOpenProtocols);

            PromenadeBroker.onMessage({type: "broker", response: "close_protocol_response"}, requestOpenProtocols);

            PromenadeBroker.onMessage({type: "broker", response: "get_protocols_response"}, setAvailableProtocols);

            PromenadeBroker.onMessage({type: "broker", response: "get_open_protocols_response"}, setOpenProtocols);

            PromenadeBroker.onDiscovery(function (response) {
                PromenadeBroker.items = []; //clear protocoless items
                response.discovery.forEach(addDiscoveryInfoToOpenProtocol);
            });

            setSavedProtocols();

        }

        return new ParlayProtocolManager();
    }

}());