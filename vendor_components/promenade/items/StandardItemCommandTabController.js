(function () {
    "use strict";

    /**
     * If the buffer is valid and available we should force the md-chips controller to push it to the ng-model.
     * @param {NodeList} chipElements - List of HTMLElements mapping to each md-chip.
     */
    function pushChipBuffer (chipElements) {
        if (chipElements.length) {
            var ctrl = angular.element(chipElements[0].querySelector('input')).scope().$mdChipsCtrl;
            var buffer = ctrl.getChipBuffer();
            if (buffer !== "") {
                ctrl.appendChip(buffer);
                ctrl.resetChipBuffer();
            }
        }
    }

    function PromenadeStandardCommandMessageFactory() {

        function PromenadeStandardCommandMessage(item_name) {
            this.item_name = item_name;
        }

        /**
         * Transforms the fields available into an equivalent Python statement.
         * @returns {String} - Python statement.
         */
        PromenadeStandardCommandMessage.prototype.toPythonStatement = function () {

            var message = this.collect(true);

            // Replace all spaces in the item name with underscores.
            var var_name = "e_" + this.item_name.replace(/\s+/g, "_");
            var setup = var_name + " = get_item_by_name('" + this.item_name + "')";

            // If we are given an empty message return only the setup.
            if (Object.getOwnPropertyNames(message).length === 0) {
                return setup;
            }

            var func = message.COMMAND ? message.COMMAND : message.FUNC;

            // Remove command or func field from message.
            delete message[Object.keys(message).find(function (field) {
                return message[field] === func;
            })];

            return setup + "\n" + var_name + "." + func + "(" + Object.keys(message).map(function (key) {
                    var value = JSON.stringify(message[key]);
                    if (value === undefined) value = "None";
                    return key + "=" + value;
                }).join(", ") + ")";
        };

        /**
         * Collects and formats the fields available on the given message object.
         * @param {Boolean} for_statement - If true we should collect the message for a Python statement, otherwise collect
         * if for a message.
         * @returns {Object} - parsed and formatted StandardItem data.
         */
        PromenadeStandardCommandMessage.prototype.collect = function (for_statement) {
            if (Object.keys(this).length < 1) {
                return undefined;
            }

            // Find root most field.
            // TODO: Should rethink this so that we don't have to hard code these values.
            var root_field = Object.keys(this).find(function (field) {
                return field.indexOf("COMMAND") > -1 || field.indexOf("FUNC") > -1;
            });

            // Build Array of relevant fields, relevant meaning a sub field of the root field.
            var relevant_fields = [root_field];

            if (this[root_field].sub_fields) {
                relevant_fields = relevant_fields.concat(this[root_field].sub_fields.map(function (field) {
                    return field.msg_key + "_" + field.input;
                }));
            }

            // Reduce these fields and their data to a Object.
            return relevant_fields.reduce(function(accumulator, field) {
                var param_name, field_type;

                if (field.indexOf('_') > -1) {
                    var split_field = field.split('_');

                    field_type = split_field[split_field.length - 1];

                    param_name = split_field.slice(0, split_field.length - 1).join('_');
                }
                else {
                    param_name = field;
                }

                // If type is Object or Array then turn the JSON string into an actual Object.
                if (field_type === "ARRAY") {
                    accumulator[param_name] = this[field].map(function (chip) {
                        return !Number.isNaN(chip.value) ? parseInt(chip.value) : chip.value;
                    });
                }
                else if (field_type === "NUMBERS") {
                    accumulator[param_name] = this[field].map(function(field) {
                        return parseFloat(field.value);
                    });
                }
                else if (angular.isObject(this[field])) {
                    accumulator[param_name] = for_statement ? this[field].name : this[field].value;
                }
                else {
                    accumulator[param_name] = this[field];
                }

                return accumulator;
            }.bind(this), {});
        };

        return PromenadeStandardCommandMessage;

    }

    /**
     * Controller constructor for the command tab.
     * @constructor
     * @param {AngularJS $scope} $scope - A AngularJS $scope Object.
     * @param {AngularJS Service} $timeout - AngularJS timeout Service.
     * @param {Parlay Service} ParlayNotification - ParlayNotification Service.
     */
    function PromenadeStandardItemCardCommandTabController($scope, ParlayNotification, PromenadeStandardCommandMessage) {

        // Due to the way JavaScript prototypical inheritance works and AngularJS scoping we want to enclose the message Object within another object.
        // Reference AngularJS "dot rule": http://jimhoskins.com/2012/12/14/nested-scopes-in-angularjs.html
        $scope.wrapper = {
            message: new PromenadeStandardCommandMessage(this.item.name)
        };

        // If there is only one field we should automatically assign it's default.
        if (this.item.content_fields && Object.keys(this.item.content_fields).length === 1) {
            Object.keys(this.item.content_fields).forEach(function (key) {
                $scope.wrapper.message[this.item.content_fields[key].msg_key + '_' + this.item.content_fields[key].input] = this.item.content_fields[key].options.find(function (option) {
                    return option.name === this.item.content_fields[key].default;
                }.bind(this));
            }.bind(this));
        }

        // Hold state of command section collapsibles.
        this.collapsible_state = {
            command_builder: false,
            script_builder: false,
            response_contents: false
        };

        // Container for pending responses.
        this.responses = [];

        /**
         * Add received response information to the pending response item.
         * @param {Array} responses - Array of pending responses.
         * @param {Object} response - Response message topics and contents.
         * @param {Boolean} success - True if the message was resolved, false otherwise.
         */
        function markResponse(responses, response, success) {
            var pending_response = responses.find(function (pending_response) {
                return pending_response.MSG_ID === response.TOPICS.MSG_ID;
            });

            if (pending_response) {
                pending_response.received = true;
                pending_response.message = response;
                pending_response.success = success;
            }
        }

        /**
         * Collects and sends the command from the form. During this process it will update controller attributes to inform the user the current status.
         * @param {Event} $event - This event's target is used to reference the md-chips element so that we can clear the buffer if available.
         */
        this.send = function ($event) {
            // Push the buffer into the md-chips ng-model
            if ($event) {
                pushChipBuffer($event.target.querySelectorAll('md-chips'));
            }

            // Add a pending response Object.
            this.responses.push({
                received: false,
                MSG_ID: this.item.getMessageId() + 1,
                message: undefined,
                success: undefined
            });

            // Remove all responses that have been received.
            this.responses = this.responses.filter(function (pending_response) {
                return !pending_response.received;
            });

            // Request that the item send the collected message.
            // When a response is received mark it as a success or failure.
            this.item.sendMessage($scope.wrapper.message.collect(false)).then(function (response) {
                markResponse(this.responses, response, true);
            }.bind(this)).catch(function (response) {
                markResponse(this.responses, response, false);
            }.bind(this));
        };

        /**
         * Copy the Python command generated by the form to the clipboard.
         */
        this.copyCommand = function() {
            var command = $scope.wrapper.message.toPythonStatement();

            if (command) {
                ParlayNotification.show({content: command.copyToClipboard() ?
                    "Command copied to clipboard." : "Copy failed. Check browser compatibility."});
            }
            else {
                ParlayNotification.show({content: "Cannot copy empty command."});
            }

        };

        this.clearResponses = function () {
            this.responses = [];
        };

        this.toggleCommandBuilder = function () {
            this.collapsible_state.command_builder = !this.collapsible_state.command_builder;
        };

        this.toggleScriptBuilder = function () {
            this.collapsible_state.script_builder = !this.collapsible_state.script_builder;
        };

        this.toggleResponseContents = function () {
            this.collapsible_state.response_contents = !this.collapsible_state.response_contents;
        };

        // Watch for new fields to fill with defaults.
        $scope.$watchCollection("wrapper.message", function () {

            var fields = Object.keys($scope.wrapper.message).filter(function (key) {
                // Build an Array with fields that have sub fields.
                return $scope.wrapper.message[key] !== undefined && $scope.wrapper.message[key].hasOwnProperty("sub_fields");
            }).map(function (key) {
                return $scope.wrapper.message[key].sub_fields;
            }).reduce(function (accumulator, current) {
                // Join all the sub_fields into a larger Array.
                return accumulator.concat(current);
            }, []);

            // Fill in the default value in the message Object.
            fields.filter(function (field) {
                // Check if the sub field has a default.
                return field !== undefined && field.default !== undefined;
            }).forEach(function (field) {
                $scope.wrapper.message[field.msg_key + '_' + field.input] = field.default;
            });

            fields.filter(function (field) {
                // Check if the sub field has a default.
                return field !== undefined && field.default === undefined;
            }).forEach(function (field) {
                if ($scope.wrapper.message[field.msg_key + '_' + field.input] === undefined && ['NUMBERS', 'STRINGS', 'ARRAY'].indexOf(field.input) > -1) {
                    $scope.wrapper.message[field.msg_key + '_' + field.input] = [];
                }
            });
        });

    }

    /**
     * Directive constructor for PromenadeStandardItemCardCommands.
     * @returns {Object} - Directive configuration.
     */
    function PromenadeStandardItemCardCommands() {
        return {
            scope: {
                item: "="
            },
            templateUrl: "../vendor_components/promenade/items/directives/promenade-standard-item-card-commands.html",
            controller: "PromenadeStandardItemCardCommandTabController",
            controllerAs: "ctrl",
            bindToController: true
        };
    }

    /**
     * Directive constructor for PromenadeStandardItemCardCommandContainer.
     * @param {AngularJS Service} RecursionHelper - Allows recursive nesting of this directive within itself for sub field support.
     * @param {Parlay Service} ParlayPersistence - Allows directive to persist values that it should retain between sessions.
     * @param {Parlay Service} ParlayUtility - Parlay Utility Service.
     * @returns {Object} - Directive configuration.
     */
    function PromenadeStandardItemCardCommandContainer(RecursionHelper, ParlayPersistence, ParlayUtility) {
        return {
            scope: {
                wrapper: '=',
                fields: '=',
                commandform: '='
            },
            templateUrl: '../vendor_components/promenade/items/directives/promenade-standard-item-card-command-container.html',
            compile: RecursionHelper.compile,
            controller: function ($scope) {

                var container = ParlayUtility.relevantScope($scope, 'container').container;
                var directive_name = 'parlayItemCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;
                var uuid = 0; // unique index for chip objects so that even chips with the same value will be 'unique'
                var max_safe_int = 9007199254740990; // per the ECMAScript2015 spec

                ParlayPersistence.monitor(directive_name, "wrapper.message", $scope, function (value) {

                    var message = $scope.wrapper.message;

                    Object.keys(value).forEach(function (key) {
                        message[key] = value[key];
                    });

                    return message;
                }.bind($scope));

                /**
                 * Packages $mdChip object for insertion into message.
                 * @param {$mdChip} chip - $mdChip Object
                 */
                $scope.prepChip = function (chip) {
                    uuid += 1;
                    if( uuid > max_safe_int) { uuid = 0;} // wrap around after max safe int
                    return {value: chip, idx: uuid};
                };

                /**
                 * Checks if the given field has sub fields available.
                 * @param {Object} field - the field we are interested in.
                 * @returns {Boolean} - true if the target field has sub fields available, false otherwise.
                 */
                $scope.hasSubFields = function (field) {
                    var message_field = $scope.wrapper.message[field.msg_key + '_' + field.input];
                    return message_field !== undefined && message_field !== null && message_field.sub_fields !== undefined;
                };

                /**
                 * Returns a given field's sub fields.
                 * @param {Object} field - the field we are interested in.
                 * @returns {Object|Array} - the fields sub fields, may be Object or Array.
                 */
                $scope.getSubFields = function (field) {
                    return $scope.wrapper.message[field.msg_key + '_' + field.input].sub_fields;
                };

            }
        };
    }

    angular.module("promenade.items.standarditem.commands", ["ngMaterial", "RecursionHelper", "parlay.store", "parlay.utility", "parlay.notification"])
        .factory("PromenadeStandardCommandMessage", [PromenadeStandardCommandMessageFactory])
        .controller("PromenadeStandardItemCardCommandTabController", ["$scope", "ParlayNotification", "PromenadeStandardCommandMessage", PromenadeStandardItemCardCommandTabController])
        .directive("promenadeStandardItemCardCommands", PromenadeStandardItemCardCommands)
        .directive("promenadeStandardItemCardCommandContainer", ["RecursionHelper", "ParlayPersistence", "ParlayUtility", PromenadeStandardItemCardCommandContainer]);

}());