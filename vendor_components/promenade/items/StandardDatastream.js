function PromenadeStandardDatastreamFactory() {

    function PromenadeStandardDatastream(data, item_name, protocol) {
        this.name = data.NAME;
        this.value = undefined;

        this.listener = protocol.onMessage({
            TX_TYPE: "DIRECT",
            MSG_TYPE: "STREAM",
            TO: "UI",
            FROM: this.item_name,
            STREAM: this.name
        }, function streamUpdater(response) {
            this.value = response.VALUE;
            Object.keys(this.onChangeListeners).forEach(function (uid) {
                this.onChangeListeners[uid](this.value);
            }, this);
        }.bind(this));

        this.item_name = item_name;
        this.protocol = protocol;

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

angular.module("promenade.items.datastream", [])
    .factory("PromenadeStandardDatastream", [PromenadeStandardDatastreamFactory]);