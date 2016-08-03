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
         * @constructor module:PromenadeStandardItem.PromenadeStandardCommand
         * @param {Object} data - Discovery information used to initialize the PromenadeStandardCommand instance with.
         * @param {String} item_name - Name of the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} this command belongs to.
         * @param {Object} protocol - Reference to the [PromenadeDirectMessage]{@link module:PromenadeDirectMessage.PromenadeDirectMessage} the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} belongs to.
         */
        function PromenadeStandardCommand (data, item_name, protocol) {

            var command = this;

            /**
             * Allow easier identification of properties, data streams, commands, etc.
             * @member module:PromenadeStandardItem.PromenadeStandardCommand#type
             * @public
             * @type {String}
             */
            command.type = "command";

            /**
             * A key describing the category of message so that the UI knows how to classify it.
             * @member module:PromenadeStandardItem.PromenadeStandardCommand#msg_key
             * @public
             * @type {String}
             */
            command.msg_key = data.MSG_KEY;

            /**
             * Type of values that the command can take.
             * @member module:PromenadeStandardItem.PromenadeStandardCommand#input
             * @public
             * @type {String}
             */
            command.input = data.INPUT;

            /**
             * True if the field is required for submission of the command.
             * @member module:PromenadeStandardItem.PromenadeStandardCommand#label
             * @public
             * @type {Boolean}
             */
            command.required =  !!data.REQUIRED ? data.REQUIRED : false;

            /**
             * Default value provided in discovery to initialize the command with.
             * @member module:PromenadeStandardItem.PromenadeStandardCommand#default
             * @public
             * @type {*}
             */
            command.default =  data.DEFAULT; // (Already undefined if there is None)

            /**
             * True if the field should not be displayed to the user.
             * @member module:PromenadeStandardItem.PromenadeStandardCommand#hidden
             * @public
             * @type {Boolean}
             */
            command.hidden =  !!data.HIDDEN ? data.HIDDEN : false;

            /**
             * Array of potential options for the PromenadeStandardCommand. Children can be simple JavaScript Objects or full
             * PromenadeStandardCommand Objects.
             * @member module:PromenadeStandardItem.PromenadeStandardCommand#options
             * @public
             * @type {Array}
             */
            command.options = !!data.DROPDOWN_OPTIONS ? data.DROPDOWN_OPTIONS.map(function (option, index) {
                // by the specification, option should always be a tuple (list in JS)
                // However, we can still return a meaningful result for a string, so we do so
                // in the interest of compatibility.
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
             * Human readable label that will be displayed instead of the command name if available.
             * @member module:PromenadeStandardItem.PromenadeStandardCommand#label
             * @public
             * @type {String}
             */
            command.label =  data.LABEL || data.DEFAULT || (!!command.options ? command.options[0].name : undefined);

            /**
             * Name of the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} this
             * command belongs to.
             * @member module:PromenadeStandardItem.PromenadeStandardCommand#item_name
             * @public
             * @type {String}
             */
            command.item_name = item_name;

            /**
             * Reference to the [PromenadeDirectMessage]{@link module:PromenadeDirectMessage.PromenadeDirectMessage} the [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} belongs to.
             * @member module:PromenadeStandardItem.PromenadeStandardCommand#protocol
             * @public
             * @type {Object}
             */
            command.protocol = protocol;

            command.generateAutocompleteEntries = generateAutocompleteEntries;

            if (command.options) {
                command.options.map(function(opt) {
                ParlayData.set(command.item_name + "." + opt.name, generateScriptAccess(opt.name));
                });
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
             * @member PromenadeStandardCommand#generateScriptAccess
             * @public
             * @returns {Function} - A function that sends this command and returns a Promise containing the response
             */
            function generateScriptAccess (command_name) {
                return function (args_object) {

                    var topics = {
                        TO: command.item_name,
                        MSG_TYPE: "COMMAND"
                    };

                    var contents = angular.copy(args_object);

                    contents.COMMAND = command_name;

                    return protocol.sendMessage(topics, contents);

                };
            }

        }

        return PromenadeStandardCommand;
    }

}());