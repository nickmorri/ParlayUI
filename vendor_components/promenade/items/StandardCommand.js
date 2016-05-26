(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("promenade.items.command", module_dependencies)
        .factory("PromenadeStandardCommand", PromenadeStandardCommandFactory);

    function PromenadeStandardCommandFactory() {

        function PromenadeStandardCommand(data, item_name, protocol) {

            var command = this;

            command.type = "command";

            command.msg_key = data.MSG_KEY;
            command.input = data.INPUT;
            command.label =  !!data.LABEL ? data.LABEL : data.MSG_KEY;
            command.required =  !!data.REQUIRED ? data.REQUIRED : false;
            command.default =  !!data.DEFAULT ? data.DEFAULT : undefined;
            command.hidden =  !!data.HIDDEN ? data.HIDDEN : false;

            command.options = !!data.DROPDOWN_OPTIONS ? data.DROPDOWN_OPTIONS.map(function (option, index) {
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

            command.item_name = item_name;
            command.protocol = protocol;

        }

        return PromenadeStandardCommand;
    }

}());
