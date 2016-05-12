(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("promenade.items.property", module_dependencies)
        .factory("PromenadeStandardProperty", PromenadeStandardPropertyFactory);

    PromenadeStandardPropertyFactory.$inject = ["$rootScope"];
    function PromenadeStandardPropertyFactory ($rootScope) {

        function PromenadeStandardProperty(data, item_name, protocol) {

            var property = this;

            property.type = "property";

            property.name = data.NAME;
            property.input = data.INPUT;
            property.read_only = data.READ_ONLY;

            // Holds internal value in the constructor closure scope.
            var internal_value;

            // Holds callbacks that are invoked on every value change.
            var onChangeCallbacks = {};

            // defineProperty so that we can define a custom setter to allow us to do the onChange callbacks.
            Object.defineProperty(property, "value", {
                writeable: true,
                enumerable: true,
                get: function () {
                    return internal_value;
                },
                set: function (new_value) {
                    internal_value = new_value;
                    Object.keys(onChangeCallbacks).forEach(function (key) {
                        onChangeCallbacks[key](internal_value);
                    });
                }
            });

            property.get = get;
            property.set = set;
            property.onChange = onChange;

            property.item_name = item_name;
            property.protocol = protocol;

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

            /**
             * Allows for callbacks to be registered, these will be invoked on change of value.
             * @param {Function} callback - Function to be invoked whenever the value attribute changes.
             * @returns {Function} - onChange deregistration function.
             */
            function onChange(callback) {
                var UID = 0;
                var keys = Object.keys(onChangeCallbacks).map(function (key) {
                    return parseInt(key, 10);
                });
                while (keys.indexOf(UID) !== -1) {
                    UID++;
                }
                onChangeCallbacks[UID] = callback;

                return function deregister() {
                    delete onChangeCallbacks[UID];
                };
            }

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

            function set () {

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

        }

        return PromenadeStandardProperty;
    }

}());