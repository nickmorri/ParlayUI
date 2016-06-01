(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("promenade.items.command", module_dependencies)
        .factory("PromenadeStandardCommand", PromenadeStandardCommandFactory);

    function PromenadeStandardCommandFactory() {

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

        }

        return PromenadeStandardCommand;
    }

}());
