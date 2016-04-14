(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("promenade.items.datastream", module_dependencies)
        .factory("PromenadeStandardDatastream", PromenadeStandardDatastreamFactory);

    function PromenadeStandardDatastreamFactory() {

        function PromenadeStandardDatastream(data, item_name, protocol) {
            this.name = data.NAME;
            this.value = undefined;

            this.item_name = item_name;
            this.protocol = protocol;

            this.listener = protocol.onMessage({
                TX_TYPE: "DIRECT",
                MSG_TYPE: "STREAM",
                TO: "UI",
                FROM: this.item_name,
                STREAM: this.name
            }, function(response) {
                this.value = response.VALUE;
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

        }

        return PromenadeStandardDatastream;
    }

}());