(function () {
    "use strict";

    var module_dependencies = ["parlay.data"];

    angular
        .module("promenade.items.property", module_dependencies)
        .factory("PromenadeStandardProperty", PromenadeStandardPropertyFactory);

    PromenadeStandardPropertyFactory.$inject = ["ParlayData", "$rootScope"];
    function PromenadeStandardPropertyFactory (ParlayData, $rootScope) {

        /**
         * Class that wraps property information provided in a discovery.
         * @constructor PromenadeStandardProperty
         * @param {Object} data - Discovery information used to initialize the PromenadeStandardProperty instance with.
         * @param {Object} data.NAME - Name of the property.
         * @param {String} item_name - Name of the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} this command belongs to.
         * @param {Object} protocol - Reference to the [PromenadeDirectMessage]{@link module:PromenadeDirectMessage.PromenadeDirectMessage} the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} belongs to.
         */
        function PromenadeStandardProperty (data, item_name, protocol) {

            var property = this;

            /**
             * Allow easier identification of properties, data streams, commands, etc.
             * @member PromenadeStandardProperty#type
             * @public
             * @type {String}
             */
            property.type = "property";

            /**
             * Name of the property.
             * @member PromenadeStandardProperty#name
             * @public
             * @type {String}
             */
            property.name = data.NAME;

            /**
             * Type of input the property accepts.
             * @member PromenadeStandardProperty#input
             * @public
             * @type {String}
             */
            property.input = data.INPUT;

            /**
             * True if the property is read only, false otherwise.
             * @member PromenadeStandardProperty#read_only
             * @public
             * @type {Boolean}
             */
            property.read_only = data.READ_ONLY;

            /**
             * Holds internal value in the constructor closure scope.
             * @member PromenadeStandardProperty#read_only
             * @private
             * @type {*}
             */
            var internal_value;

            /**
             * Holds callbacks that are invoked on every value change.
             * @member PromenadeStandardProperty#on_change_callbacks
             * @private
             * @type {Object}
             */
            var on_change_callbacks = {};

            /**
             * Define a custom setter to allow us to invoke the onChange callbacks.
             * Stores actual value in [internal_value]{@link PromenadeStandardProperty#internal_value}
             * @member PromenadeStandardProperty#value
             * @public
             * @type {*}
             */
            Object.defineProperty(property, "value", {
                writeable: true,
                enumerable: true,
                get: function () {
                    return internal_value;
                },
                set: function (new_value) {
                    internal_value = new_value;
                    Object.keys(on_change_callbacks).forEach(function (key) {
                        on_change_callbacks[key](internal_value);
                    });
                }
            });

            /**
             * Name of the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} this 
             * property belongs to.
             * @member PromenadeStandardProperty#item_name
             * @public
             * @type {String}
             */
            property.item_name = item_name;

            /**
             * Reference to the [PromenadeDirectMessage]{@link module:PromenadeDirectMessage.PromenadeDirectMessage} the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} belongs to.
             * @member PromenadeStandardProperty#protocol
             * @public
             * @type {Object}
             */
            property.protocol = protocol;

            // Attach methods to PromenadeStandardProperty.
            property.get = get;
            property.set = set;
            property.onChange = onChange;
            property.generateAutocompleteEntries = generateAutocompleteEntries;
            property.generateInterpreterWrappers = generateInterpreterWrappers;

            /**
             * Requests a listener for the property. Saves a reference to deregistration function returned by
             * [PromenadeDirectMessage.onMessage]{@link module:PromenadeDirectMessage.PromenadeDirectMessage#onMessage}.
             * @member PromenadeStandardProperty#listener
             * @public
             * @type {Function}
             */
            property.listener = protocol.onMessage({
                TX_TYPE: "DIRECT",
                MSG_TYPE: "RESPONSE",
                FROM: property.item_name,
                TO: "UI"
            }, function(response) {
                // TODO: Talk with Daniel about refactoring property API to require property name in topics.
                if (property.name == response.PROPERTY && response.VALUE) {
                    $rootScope.$apply(function () {
                        property.value = response.VALUE;
                    });
                }
            });

            ParlayData.set(property.name, property);

            /**
             * Allows for callbacks to be registered, these will be invoked on change of value.
             * @member PromenadeStandardProperty#onChange
             * @public
             * @param {Function} callback - Function to be invoked whenever the value attribute changes.
             * @returns {Function} - onChange deregistration function.
             */
            function onChange (callback) {
                var UID = 0;
                var keys = Object.keys(on_change_callbacks).map(function (key) {
                    return parseInt(key, 10);
                });
                while (keys.indexOf(UID) !== -1) {
                    UID++;
                }
                on_change_callbacks[UID] = callback;

                return function deregister() {
                    delete on_change_callbacks[UID];
                };
            }

            /**
             * Requests the current value of the PromenadeStandardProperty.
             * @member PromenadeStandardProperty#get
             * @public
             * @returns {$q.deferred.Promise} - Resolved on response receipt.
             */
            function get () {

                var topics = {
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "PROPERTY",
                    TO: property.item_name
                };
                var contents = {
                    PROPERTY: property.name,
                    ACTION: "GET",
                    VALUE: null
                };
                var response_topics = {
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "RESPONSE",
                    FROM: property.item_name,
                    TO: "UI"
                };

                return protocol.sendMessage(topics, contents, response_topics, true);
            }

            /**
             * Sets the value of the PromenadeStandardProperty to the given value.
             * @member PromenadeStandardProperty#set
             * @public
             * @param {(Number|String|Object)} value - Value to set.
             * @returns {$q.deferred.Promise} - Resolved on response receipt.
             */
            function set (value) {

                if (!!value) {
                    property.value = value;
                }

                var topics = {
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "PROPERTY",
                    TO: property.item_name
                };

                var contents = {
                    PROPERTY: property.name,
                    ACTION: "SET",
                    VALUE: property.value
                };

                var response_topics = {
                    TX_TYPE: "DIRECT",
                    MSG_TYPE: "RESPONSE",
                    FROM: property.item_name,
                    TO: "UI"
                };

                return protocol.sendMessage(topics, contents, response_topics, true);
            }

            /**
             * Generates entry for Ace editor autocomplete consumed by ParlayWidget.
             * @member PromenadeStandardProperty#generateAutocompleteEntries
             * @public
             * @returns {Array.Object} - Entry used to represent the PromenadeStandardProperty.
             */
            function generateAutocompleteEntries () {

                var get_entry = {
                    caption: property.item_name + "." + property.name + ".get()",
                    value: property.item_name + "." + property.name + ".get()",
                    meta: "PromenadeStandardProperty method"
                };

                var set_entry = {
                    caption: property.item_name + "." + property.name + ".set(" + property.value + ")",
                    value: property.item_name + "." + property.name + ".set(" + property.value + ")",
                    meta: "PromenadeStandardProperty method"
                };

                var value_entry = {
                    caption: property.item_name + "." + property.name + ".value",
                    value: property.item_name + "." + property.name + ".value",
                    meta: "PromenadeStandardProperty value"
                };

                return [get_entry, set_entry, value_entry];
            }

            /**
             * Generates Objects with Function references to be used in the ParlayWidgetJSInterpreter.
             * @member PromenadeStandardProperty#generateInterpreterWrappers
             * @public
             * @returns {Array.Object} - Objects containing function references.
             */
            function generateInterpreterWrappers () {
                return [
                    {
                        expression: "get",
                        type: "function",
                        reference: property.get
                    },
                    {
                        expression: "set",
                        type: "function",
                        reference: property.set
                    },
                    {
                        expression: "value",
                        type: "value",
                        reference: property.value
                    }
                ];
            }

        }

        return PromenadeStandardProperty;
    }

}());