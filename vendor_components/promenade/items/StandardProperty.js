function PromenadeStandardPropertyFactory() {
    
    function PromenadeStandardProperty(data, item_name, protocol) {
        this.name = data.NAME;
        this.input = data.INPUT;
        this.read_only = data.READ_ONLY;
        this.value = undefined;

        this.item_name = item_name;
        this.protocol = protocol;

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
            }, true).then(function(response) {
                this.value = response.CONTENTS.VALUE;
                return response;
            }.bind(this));
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
    }

    return PromenadeStandardProperty;
}

angular.module("promenade.items.property", [])
    .factory("PromenadeStandardProperty", [PromenadeStandardPropertyFactory]);