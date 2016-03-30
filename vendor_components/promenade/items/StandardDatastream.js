function PromenadeStandardDatastreamFactory() {

    function PromenadeStandardDatastream(stream_name, item_name, protocol) {
        this.value = undefined;
        this.listener = protocol.onMessage({
            TX_TYPE: "DIRECT",
            MSG_TYPE: "STREAM",
            TO: "UI",
            FROM: item_name,
            STREAM: stream_name,
            STOP: false
        }, function streamUpdater(response) {
            this.value = response.VALUE;
        }.bind(this));
    }

    return PromenadeStandardDatastream;
}

angular.module("promenade.items.datastream", []).factory("PromenadeStandardDatastream", [PromenadeStandardDatastreamFactory]);