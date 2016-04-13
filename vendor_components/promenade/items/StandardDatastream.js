function PromenadeStandardDatastreamFactory(ParlayData, $rootScope) {

    function PromenadeStandardDatastream(data, item_name, protocol) {

        this.type = "datastream";

        this.name = data.NAME;

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
            var keys = Object.keys(onChangeCallbacks).map(function (key) { return parseInt(key, 10); });
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
            MSG_TYPE: "STREAM",
            TO: "UI",
            FROM: this.item_name,
            STREAM: this.name
        }, function(response) {
            $rootScope.$apply(function () {
                this.value = response.VALUE;
            }.bind(this));
        }.bind(this));

        this.listen = function (stop) {
            return protocol.sendMessage({
                TX_TYPE: "DIRECT",
                MSG_TYPE: "STREAM",
                TO: this.item_name
            },
            {
                STREAM: this.name,
                STOP: stop
            },
            {
                TX_TYPE: "DIRECT",
                MSG_TYPE: "STREAM",
                TO: "UI",
                FROM: this.item_name
            });
        };

        ParlayData.set(this.name, this);

    }

    return PromenadeStandardDatastream;
}

angular.module("promenade.items.datastream", ["parlay.data"])
    .factory("PromenadeStandardDatastream", ["ParlayData", "$rootScope", PromenadeStandardDatastreamFactory]);