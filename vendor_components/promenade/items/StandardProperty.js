(function () {
    "use strict";

    var module_dependencies = ["parlay.data"];

    angular
        .module("promenade.items.property", module_dependencies)
        .factory("PromenadeStandardProperty", PromenadeStandardPropertyFactory);

    PromenadeStandardPropertyFactory.$inject = ["ParlayData", "$rootScope"];
    function PromenadeStandardPropertyFactory (ParlayData, $rootScope) {

        function PromenadeStandardProperty(data, item_name, protocol) {

            this.type = "property";

            this.name = data.NAME;
            this.input = data.INPUT;
            this.read_only = data.READ_ONLY;

            // Holds internal value in the constructor closure scope.
            var internal_value;

            // Holds callbacks that are invoked on every value change.
            var onChangeCallbacks = {};

            // defineProperty so that we can define a custom setter to allow us to do the onChange callbacks.
            Object.defineProperty(this, "value", {
                writeable: true,
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

            /**
             * Allows for callbacks to be registered, these will be invoked on change of value.
             * @param {Function} callback - Function to be invoked whenever the value attribute changes.
             * @returns {Function} - onChange deregistration function.
             */
            this.onChange = function (callback) {
                var UID = 0;
                var keys = Object.keys(onChangeCallbacks);
                while (keys.indexOf(UID) !== -1) {
                    UID++;
                }
                onChangeCallbacks[UID] = callback;

                return function deregister() {
                    delete onChangeCallbacks[UID];
                };
            };

            this.item_name = item_name;
            this.protocol = protocol;

            this.listener = protocol.onMessage({
                TX_TYPE: "DIRECT",
                MSG_TYPE: "RESPONSE",
                FROM: this.item_name,
                TO: "UI"
            }, function(response) {
                // TODO: Talk with Daniel about refactoring property API to require property name in topics.
                if (this.name == response.PROPERTY && response.VALUE) {
                    $rootScope.$apply(function () {
                        this.value = response.VALUE;
                    }.bind(this));
                }
            }.bind(this));

            this.get = function () {
                return protocol.sendMessage({
                        TX_TYPE: "DIRECT",
                        MSG_TYPE: "PROPERTY",
                        TO: this.item_name
                    },
                    {
                        PROPERTY: this.name,
                        ACTION: "GET",
                        VALUE: null
                    },
                    {
                        TX_TYPE: "DIRECT",
                        MSG_TYPE: "RESPONSE",
                        FROM: this.item_name,
                        TO: "UI"
                    }, true);
            };

            this.set = function () {
                return protocol.sendMessage({
                        TX_TYPE: "DIRECT",
                        MSG_TYPE: "PROPERTY",
                        TO: this.item_name
                    },
                    {
                        PROPERTY: this.name,
                        ACTION: "SET",
                        VALUE: this.value
                    },
                    {
                        TX_TYPE: "DIRECT",
                        MSG_TYPE: "RESPONSE",
                        FROM: this.item_name,
                        TO: "UI"
                    }, true);
            };

            ParlayData.set(this.name, this);

        }

        return PromenadeStandardProperty;
    }

}());