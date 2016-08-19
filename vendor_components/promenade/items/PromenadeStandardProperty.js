(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("promenade.items.property", module_dependencies)
        .factory("PromenadeStandardProperty", PromenadeStandardPropertyFactory);

    PromenadeStandardPropertyFactory.$inject = ["$rootScope"];
    function PromenadeStandardPropertyFactory ($rootScope) {

        /**
         * Class that wraps property information provided in a discovery.
         * @constructor module:PromenadeStandardItem.PromenadeStandardProperty
         * @param {Object} data - Discovery information used to initialize the PromenadeStandardProperty instance with.
         * @param {Object} data.NAME - Name of the property.
         * @param {String} item_name - Name of the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} this command belongs to.
         * @param {Object} protocol - Reference to the [PromenadeDirectMessage]{@link module:PromenadeDirectMessage.PromenadeDirectMessage} the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} belongs to.
         */
        function PromenadeStandardProperty (data, item_name, protocol) {

            var property = this;

            /**
             * Allow easier identification of properties, data streams, commands, etc.
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#type
             * @public
             * @type {String}
             */
            property.type = "property";

            /**
             * ID of the property.
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#name
             * @public
             * @type {String}
             */
            property.id = data.PROPERTY;
            /**
             * Name of the property.
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#name
             * @public
             * @type {String}
             */
            property.name = data.PROPERTY_NAME !== undefined ? data.PROPERTY_NAME : property.id;

            /**
             * Type of input the property accepts.
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#input
             * @public
             * @type {String}
             */
            property.input = data.INPUT;

            /**
             * True if the property is read only, false otherwise.
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#read_only
             * @public
             * @type {Boolean}
             */
            property.read_only = data.READ_ONLY;

            /**
             * Holds internal value in the constructor closure scope.
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#read_only
             * @private
             * @type {*}
             */
            var internal_value;

            /**
             * Holds callbacks that are invoked on every value change.
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#on_change_callbacks
             * @private
             * @type {Object}
             */
            var on_change_callbacks = {};

            /**
             * Define a custom setter to allow us to invoke the onChange callbacks.
             * Stores actual value in [internal_value]{@link PromenadeStandardProperty#internal_value}
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#value
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
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#item_name
             * @public
             * @type {String}
             */
            property.item_name = item_name;

            /**
             * Reference to the [PromenadeDirectMessage]{@link module:PromenadeDirectMessage.PromenadeDirectMessage} the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} belongs to.
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#protocol
             * @public
             * @type {Object}
             */
            property.protocol = protocol;

            // Attach methods to PromenadeStandardProperty.
            property.get = get;
            property.set = set;
            property.onChange = onChange;

            /**
             * Requests a listener for the property. Saves a reference to deregistration function returned by
             * [PromenadeDirectMessage.onMessage]{@link module:PromenadeDirectMessage.PromenadeDirectMessage#onMessage}.
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#listener
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
                // Check that the response value is not undefined, fixes bug where property is not displayed if value is 0
                if (property.id == response.PROPERTY && response.VALUE !== undefined) {
                    $rootScope.$apply(function () {
                        property.value = response.VALUE;
                    });
                }
            });

            /**
             * Allows for callbacks to be registered, these will be invoked on change of value.
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#onChange
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
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#get
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
                    PROPERTY: property.id,
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
             * @member module:PromenadeStandardItem.PromenadeStandardProperty#set
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
                    PROPERTY: property.id,
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

        }

        return PromenadeStandardProperty;
    }

}());