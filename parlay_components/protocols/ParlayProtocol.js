(function () {
    "use strict";

    /**
     * @module ParlayProtocol
     */

    var module_dependencies = ["parlay.socket", "parlay.items.item", "promenade.protocols.directmessage", "parlay.settings"];

    angular
        .module("parlay.protocols.protocol", module_dependencies)
        .run(ParlayProtocolRun)
        .factory("ParlayProtocol", ParlayProtocolFactory);

    ParlayProtocolRun.$inject = ["ParlaySettings"];
    function ParlayProtocolRun (ParlaySettings) {
        ParlaySettings.registerDefault("log", {max_size: 10000});

        if (!ParlaySettings.has("log")) {
            ParlaySettings.restoreDefault("log");
        }
    }

    ParlayProtocolFactory.$inject = ["ParlaySocket", "ParlayItem", "ParlaySettings", "$q"];
    function ParlayProtocolFactory (ParlaySocket, ParlayItem, ParlaySettings, $q) {

        /**
         * @abstract
         * @constructor module:ParlayProtocol.ParlayProtocol
         * @param {Object} configuration - Contains details neccessary to configure a ParlayProtocol.
         * @param {String} configuration.name - Name used to identify a protocol.
         * @param {String} configuration.protocol_type - String representation of the protocol's type.
         */
        function ParlayProtocol (configuration) {

            /**
             * Unique id of the protocol.
             * @member module:ParlayProtocol.ParlayProtocol#id
             * @public
             * @type {string}
             * @default
             */
            this.id = "UI";

            /**
             * Human readable name used to identify a protocol.
             * @member module:ParlayProtocol.ParlayProtocol#protocol_name
             * @public
             * @type {string}
             */
            this.protocol_name = configuration.name;

            /**
             * String representation of the protocol's type.
             * @member module:ParlayProtocol.ParlayProtocol#type
             * @public
             * @type {string}
             */
            this.type = configuration.protocol_type;

            /**
             * Contains all available items connected to the protocol.
             * @member module:ParlayProtocol.ParlayProtocol#available_items
             * @public
             * @type {Array}
             */
            this.available_items = [];

            /**
             * Contains all messages, up to the limit specified in ParlaySettings, exchanged over the protocol.
             * @member module:ParlayProtocol.ParlayProtocol#log
             * @public
             * @type {Array}
             */
            this.log = [];

            /**
             * Contains any onMessage listeners that have been registered on the protocol.
             * @member module:ParlayProtocol.ParlayProtocol#listeners
             * @public
             * @type {Object}
             */
            this.listeners = {};

            /**
             * Reference to the factory used to produce models for items connected to the protocol.
             * Protocols that inherit from this ParlayProtocol's prototype can set their own item_factory.
             * @member module:ParlayProtocol.ParlayProtocol#item_factory
             * @public
             * @type {Object}
             */
            this.item_factory = ParlayItem;
        }

        /**
         * Returns name of protocol.
         * @member module:ParlayProtocol.ParlayProtocol#getName
         * @public
         * @returns {String} protocol name
         */
        ParlayProtocol.prototype.getName = function () {
            return this.protocol_name;
        };

        /**
         * Returns type of protocol.
         * @member module:ParlayProtocol.ParlayProtocol#getType
         * @public
         * @returns {String} protocol type
         */
        ParlayProtocol.prototype.getType = function () {
            return this.type;
        };

        /**
         * Returns available items in protocol.
         * @member module:ParlayProtocol.ParlayProtocol#getAvailableItems
         * @public
         * @returns {Array} available items
         */
        ParlayProtocol.prototype.getAvailableItems = function () {
            return this.available_items;
        };

        /**
         * Returns all messages that have been collected by the protocol.
         * @member module:ParlayProtocol.ParlayProtocol#getLog
         * @public
         * @returns {Array} - messages collected by protocol.
         */
        ParlayProtocol.prototype.getLog = function () {
            return this.log;
        };

        /**
         * Records a listener's deregistration function with the protocol.
         * We want to record this function so that when the protocol is closed can clear all onMessage listeners that are relevant to this protocol.
         * @member module:ParlayProtocol.ParlayProtocol#registerListener
         * @public
         * @param {Object} topics - Map of key/value pairs.
         * @param {Function} deregistrationFn - Function returned from ParlaySocket that will cancel the onMessage callback.
         */
        ParlayProtocol.prototype.registerListener = function (topics, deregistrationFn) {
            // JSONify the topics Object so that it can be used as a key in our listeners Object..
            var topics_string = JSON.stringify(topics);

            // Store the deregistrationFn.
            this.listeners[topics_string] = deregistrationFn;

            // Return a callback that will call the deregistrationFn and remove the entry from the listeners Object
            // when called.
            return function() {
                if (this.listeners[topics_string]) {
                    this.listeners[topics_string]();
                    delete this.listeners[topics_string];
                }
            }.bind(this);
        };

        /**
         * Registers and callback that will be called whenever the topics match.
         * @member module:ParlayProtocol.ParlayProtocol#onMessage
         * @public
         * @param {Object} response_topics - Map of key/value pairs.
         * @param {Function} callback - Callback to invoke upon receipt of response.
         * @param {Boolean} verbose - If true full response is given to callback, otherwise a reduced Object is returned.
         * @returns {Function} - Listener deregistration.
         */
        ParlayProtocol.prototype.onMessage = function (response_topics, callback, verbose) {

            // Include this.id in the response topics we will listen for.
            var topics = angular.merge({TO: this.id}, response_topics);

            // Register a listener with ParlaySocket and record the deregistration on this protocol.
            var deregistration = ParlaySocket.onMessage(topics, callback, verbose);
            return this.registerListener(topics, deregistration);
        };

        /**
         * Sends message through ParlaySocket.
         * @member module:ParlayProtocol.ParlayProtocol#sendMessage
         * @public
         * @param {Object} topics - Map of key/value pairs.
         * @param {Object} contents - Map of key/value pairs.
         * @param {Object} response_topics - Map of key/value pairs.
         * @param {Boolean} verbose - If true we should invoke callback with full message. If false or undefined invoke with only contents for simplicity.
         * @returns {$q.defer.Promise} - Resolved if ParlaySocket receives a response, rejected if an error occurs during send.
         */
        ParlayProtocol.prototype.sendMessage = function (topics, contents, response_topics, verbose) {
            return $q(function(resolve, reject) {
                try {
                    ParlaySocket.sendMessage(topics, contents, response_topics, resolve, verbose);
                }
                catch (error) {
                    reject(error);
                }
            });
        };

        /**
         * Will be called on protocol open.
         * @member module:ParlayProtocol.ParlayProtocol#onOpen
         * @public
         */
        ParlayProtocol.prototype.onOpen = function () {
            // Ensure that we record all messages address to the UI.
            this.onMessage({}, function (response) {
                // Upon reaching the 1.5 times the maximum specified log size we should remove 0.5
                // the maximum size elements from the beginning of the log.
                if (this.log.length >= ParlaySettings.get("log").max_size * 1.5) {
                    this.log.splice(0, ParlaySettings.get("log").max_size * 0.5);
                }

                this.log.push(response);
            }.bind(this), true);
        };

        /**
         * Will be called on protocol close.
         * @member module:ParlayProtocol.ParlayProtocol#onClose
         * @public
         */
        ParlayProtocol.prototype.onClose = function () {
            // Call the deregistration function of each listener.
            for (var listener in this.listeners) {
                if (this.listeners.hasOwnProperty(listener)) {
                    this.listeners[listener]();
                }
            }

            // Clear the references to the listeners deregistration.
            this.listeners = {};

            // Clear the references to all available items.
            this.available_items = [];
        };

        /**
         * Distributes discovery message to all relevant methods.
         * @member module:ParlayProtocol.ParlayProtocol#addDiscoveryInfo
         * @public
         * @param {Object} info - Discovery message
         */
        ParlayProtocol.prototype.addDiscoveryInfo = function (info) {
            // Populate the available items from the discovery message if children is an Array, otherwise
            // set to an empty Array.
            this.available_items = Array.isArray(info.CHILDREN) ? info.CHILDREN.map(function (item) {
                // Use the registered item_factory to produce models of the items.
                return new this.item_factory(item, this);
            }, this) : [];
        };

        return ParlayProtocol;
    }

}());