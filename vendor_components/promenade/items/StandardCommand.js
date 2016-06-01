(function () {
    "use strict";

    var module_dependencies = ["parlay.data"];

    angular
        .module("promenade.items.command", module_dependencies)
        .factory("PromenadeStandardCommand", PromenadeStandardCommandFactory);

    PromenadeStandardCommandFactory.$inject = ["ParlayData"];
    function PromenadeStandardCommandFactory (ParlayData) {

        /**
         * Class that wraps command information provided in a discovery.
         * @constructor PromenadeStandardCommand
         * @param {Object} data - Discovery information used to initialize the PromenadeStandardCommand instance with.
         * @param {String} item_name - Name of the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} this command belongs to.
         * @param {Object} protocol - Reference to the [PromenadeDirectMessage]{@link module:PromenadeDirectMessage.PromenadeDirectMessage} the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} belongs to.
         */
        function PromenadeStandardCommand (data, item_name, protocol) {

            var command = this;

            /**
             * Allow easier identification of properties, data streams, commands, etc.
             * @member PromenadeStandardCommand#type
             * @public
             * @type {String}
             */
            command.type = "command";

            /**
             * Uniquely identifying key for each command.
             * @member PromenadeStandardCommand#msg_key
             * @public
             * @type {String}
             */
            command.msg_key = data.MSG_KEY;

            /**
             * Type of values that the command can take.
             * @member PromenadeStandardCommand#input
             * @public
             * @type {String}
             */
            command.input = data.INPUT;

            /**
             * Human readable label that will be displayed instead of the message key if available.
             * @member PromenadeStandardCommand#label
             * @public
             * @type {String}
             */
            command.label =  !!data.LABEL ? data.LABEL : data.MSG_KEY;

            /**
             * True if the field is required for submission of the command.
             * @member PromenadeStandardCommand#label
             * @public
             * @type {Boolean}
             */
            command.required =  !!data.REQUIRED ? data.REQUIRED : false;

            /**
             * Default value provided in discovery to initialize the command with.
             * @member PromenadeStandardCommand#default
             * @public
             * @type {*}
             */
            command.default =  !!data.DEFAULT ? data.DEFAULT : undefined;

            /**
             * True if the field should not be displayed to the user.
             * @member PromenadeStandardCommand#hidden
             * @public
             * @type {Boolean}
             */
            command.hidden =  !!data.HIDDEN ? data.HIDDEN : false;

            /**
             * Array of potential options for the PromenadeStandardCommand. Children can be simple JavaScript Objects or full
             * PromenadeStandardCommand Objects.
             * @member PromenadeStandardCommand#options
             * @public
             * @type {Array}
             */
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

            /**
             * Name of the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} this
             * command belongs to.
             * @member PromenadeStandardCommand#item_name
             * @public
             * @type {String}
             */
            command.item_name = item_name;

            /**
             * Reference to the [PromenadeDirectMessage]{@link module:PromenadeDirectMessage.PromenadeDirectMessage} the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} belongs to.
             * @member PromenadeStandardCommand#protocol
             * @public
             * @type {Object}
             */
            command.protocol = protocol;

            command.generateAutocompleteEntries = generateAutocompleteEntries;
            command.generateInterpreterWrappers = generateInterpreterWrappers;

            if (command.options) {
                ParlayData.set(command.msg_key, command);
            }

            /**
             * Generates entries for Ace editor autocomplete consumed by ParlayWidget.
             * @member PromenadeStandardCommand#generateAutocompleteEntries
             * @public
             * @returns {Array.Object} - Entries used to represent the PromenadeStandardCommand.
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

            /**
             * Generates Objects with Function references to be used in the ParlayWidgetJSInterpreter.
             * @member PromenadeStandardCommand#generateInterpreterWrappers
             * @public
             * @returns {Array.Object} - Objects containing function references.
             */
            function generateInterpreterWrappers () {
                return command.options.map(function (sub_command) {
                    return {
                        expression: sub_command.name,
                        type: "function",
                        reference: function (args_object) {

                            var topics = {
                                TO: command.item_name,
                                MSG_TYPE: "COMMAND"
                            };

                            var contents = angular.copy(args_object);

                            contents.COMMAND = sub_command.name;

                            protocol.sendMessage(topics, contents);

                        }
                    };
                });
            }

        }

        return PromenadeStandardCommand;
    }

}());