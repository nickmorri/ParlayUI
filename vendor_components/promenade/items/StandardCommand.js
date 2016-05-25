(function () {
    "use strict";

    var module_dependencies = ["parlay.data"];

    angular
        .module("promenade.items.command", module_dependencies)
        .factory("PromenadeStandardCommand", PromenadeStandardCommandFactory);

    PromenadeStandardCommandFactory.$inject = ["ParlayData"];
    function PromenadeStandardCommandFactory (ParlayData) {

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

            command.generateAutocompleteEntries = generateAutocompleteEntries;

            if (command.options) {
                ParlayData.set(command.msg_key, command);
            }

            /**
             * Generates entries for Ace editor autocomplete consumed by ParlayWidget.
             * @returns {Array[Object]} - Entries used to represent the PromenadeStandardCommand.
             */
            function generateAutocompleteEntries () {
                // Array of entries of the available commands.
                return command.options.map(function (sub_command) {

                    // TestItem.echo(
                    var entry_prefix = command.item_name + "." + sub_command.name + "(";

                    // if sub_command.sub_fields then {"string": "hello world"}
                    // else ""
                    var entry_suffix = sub_command.sub_fields ? "{" + sub_command.sub_fields.map(function (current_parameter) {
                        if (!!current_parameter.default) {
                            return '"' + current_parameter.msg_key + '":' + current_parameter.default;
                        }
                        else if (current_parameter.input == "ARRAY" || current_parameter.input == "STRINGS" || current_parameter.input == "NUMBERS") {
                            return '"' + current_parameter.msg_key + '":[]';
                        }
                        else if (current_parameter.input == "STRING") {
                            return '"' + current_parameter.msg_key + '":""';
                        }
                        else if (current_parameter.input == "NUMBER") {
                            return '"' + current_parameter.msg_key + '":0';
                        }
                        else {
                            return '"' + current_parameter.msg_key + '":undefined';
                        }
                    }).join(", ") + "}" : "";

                    return {
                        caption: entry_prefix + ")",
                        value: entry_prefix + entry_suffix + ")",
                        meta: "PromenadeStandardCommand"
                    };
                });
            }

        }

        return PromenadeStandardCommand;
    }

}());