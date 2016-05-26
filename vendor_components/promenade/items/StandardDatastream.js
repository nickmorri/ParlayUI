(function () {
    "use strict";

    var module_dependencies = ["parlay.data"];

    angular
        .module("promenade.items.datastream", module_dependencies)
        .factory("PromenadeStandardDatastream", PromenadeStandardDatastreamFactory);

    PromenadeStandardDatastreamFactory.$inject = ["ParlayData", "$rootScope"];
    function PromenadeStandardDatastreamFactory (ParlayData, $rootScope) {

        function PromenadeStandardDatastream(data, item_name, protocol) {

            var datastream = this;

            datastream.type = "datastream";

            datastream.name = data.NAME;

            // Holds internal value in the constructor closure scope.
            var internal_value;

            // Holds callbacks that are invoked on every value change.
            var onChangeCallbacks = {};

            // defineProperty so that we can define a custom setter to allow us to do the onChange callbacks.
            Object.defineProperty(datastream, "value", {
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

            datastream.item_name = item_name;
            datastream.protocol = protocol;

            datastream.listener = protocol.onMessage({
                TX_TYPE: "DIRECT",
                MSG_TYPE: "STREAM",
                TO: "UI",
                FROM: datastream.item_name,
                STREAM: datastream.name
            }, function(response) {
                $rootScope.$apply(function () {
                    datastream.value = response.VALUE;
                });
            });

            datastream.listen = listen;
            datastream.onChange = onChange;
            datastream.generateAutocompleteEntries = generateAutocompleteEntries;
            datastream.generateInterpreterWrappers = generateInterpreterWrappers;

            ParlayData.set(datastream.name, datastream);

            /**
             * Allows for callbacks to be registered, these will be invoked on change of value.
             * @param {Function} callback - Function to be invoked whenever the value attribute changes.
             * @returns {Function} - onChange deregistration function.
             */
            function onChange(callback) {
                var UID = 0;
                var keys = Object.keys(onChangeCallbacks).map(function (key) { return parseInt(key, 10); });
                while (keys.indexOf(UID) !== -1) {
                    UID++;
                }
                onChangeCallbacks[UID] = callback;

                return function deregister() {
                    delete onChangeCallbacks[UID];
                };
            }

            function listen(stop) {
                return protocol.sendMessage({
                        TX_TYPE: "DIRECT",
                        MSG_TYPE: "STREAM",
                        TO: datastream.item_name
                    },
                    {
                        STREAM: datastream.name,
                        STOP: stop
                    },
                    {
                        TX_TYPE: "DIRECT",
                        MSG_TYPE: "STREAM",
                        TO: "UI",
                        FROM: datastream.item_name
                    });
            }

            /**
             * Generates entry for Ace editor autocomplete consumed by ParlayWidget.
             * @returns {Array.Object} - Entry used to represent the PromenadeStandardDatastream.
             */
            function generateAutocompleteEntries () {

                var value_entry = {
                    caption: datastream.item_name + "." + datastream.name + ".value",
                    value: datastream.item_name + "." + datastream.name + ".value",
                    meta: "PromenadeDataStream value"
                };

                return [value_entry];
            }

            function generateInterpreterWrappers () {
                return [
                    {
                        expression: "listen",
                        type: "function",
                        reference: datastream.listen
                    },
                    {
                        expression: "value",
                        type: "value",
                        reference: datastream.value
                    }
                ];
            }

        }

        return PromenadeStandardDatastream;
    }

}());