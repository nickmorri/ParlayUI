function PromenadeStandardCommandFactory() {

    function PromenadeStandardCommand(data, item_name, protocol) {
        
        this.type = "command";
        
        this.msg_key = data.MSG_KEY;
        this.input = data.INPUT;
        this.label =  !!data.LABEL ? data.LABEL : data.MSG_KEY;
        this.required =  !!data.REQUIRED ? data.REQUIRED : false;
        this.default =  !!data.DEFAULT ? data.DEFAULT : undefined;
        this.hidden =  !!data.HIDDEN ? data.HIDDEN : false;

        this.options = !!data.DROPDOWN_OPTIONS ? data.DROPDOWN_OPTIONS.map(function (option, index) {
            return typeof option === "string" ? {
                name: option,
                value: option,
                sub_fields: undefined
            } : {
                name: option[0],
                value: option[1],
                sub_fields: !!data.DROPDOWN_SUB_FIELDS ? data.DROPDOWN_SUB_FIELDS[index].map(function (sub_field) {
                    return new PromenadeStandardCommand(sub_field);
                }) : undefined
            };
        }) : undefined;

        this.item_name = item_name;
        this.protocol = protocol;
    }

    return PromenadeStandardCommand;
}

angular.module("promenade.items.command", [])
    .factory("PromenadeStandardCommand", [PromenadeStandardCommandFactory]);