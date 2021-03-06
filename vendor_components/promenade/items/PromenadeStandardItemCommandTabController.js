(function () {
    "use strict";

    var module_name = "promenade.items.standarditem.commands";
    var module_dependencies = ["ngMessages", "RecursionHelper", "parlay.utility", "parlay.notification", "parlay.widget.manager"];

    // Register module as [PromenadeStandardItem]{@link module:PromenadeStandardItem.PromenadeStandardItem} dependency.
    standard_item_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .factory("PromenadeStandardCommandMessage", PromenadeStandardCommandMessageFactory)
        .controller("PromenadeStandardItemCardCommandTabController", PromenadeStandardItemCardCommandTabController)
        .controller("PromenadeStandardItemCardCommandContainerController", PromenadeStandardItemCardCommandContainerController)
        .directive("promenadeStandardItemCardCommands", PromenadeStandardItemCardCommands)
        .directive("promenadeStandardItemCardCommandContainer", PromenadeStandardItemCardCommandContainer)
        .directive("promenadeStandardItemCardCommandContainerChips", PromenadeStandardItemCardCommandContainerChipsDirective);

    function PromenadeStandardCommandMessageFactory () {

        /**
         * Representation of a message for a
         * [PromenadeStandardCommand]{@link module:PromenadeStandardItem.PromenadeStandardCommand}.
         * @constructor module:PromenadeStandardItem.PromenadeStandardCommandMessage
         * @param {String} item_name - Name of the [ParlayItem]{@link module:ParlayItem.ParlayItem} that the command
         * belongs to.
         * @param {Object} data - Data from a prior session used to populate the message.
         */
        function PromenadeStandardCommandMessage (item_name, data) {
            this.item_name = item_name;

            // If during initialization a data Object is provided we should merge it to this Object.
            if (!!data) {
                angular.merge(this, data);
            }

        }

        /**
         * Transforms the fields available into an equivalent Python statement.
         * @method module:PromenadeStandardItem.PromenadeStandardCommandMessage#toPythonStatement
         * @public
         * @returns {String} - Python statement.
         */
        PromenadeStandardCommandMessage.prototype.toPythonStatement = function () {

            var message = this.collect(true);

            // Replace all spaces in the item name with underscores.
            var var_name = "e_" + this.item_name.replace(/[^0-9a-zA-Z_]/g, "");
            var_name = var_name.replace(/\s+/g, "_");
            var setup = var_name + " = get_item_by_name('" + this.item_name + "')";

            // If we are given an empty message return only the setup.
            if (message === undefined || Object.getOwnPropertyNames(message).length === 0) {
                return setup;
            }

            var func = message.COMMAND ? message.COMMAND : message.FUNC;

            // Remove command or func field from message.
            delete message[Object.keys(message).find(function (field) {
                return message[field] === func;
            })];

            return setup + "\n" + var_name + "." + func + "(" + Object.keys(message).map(function (key) {
                    var value = JSON.stringify(message[key]);
                    if (value === undefined) {
                        value = "None";
                    }
                    return key + "=" + value;
                }).join(", ") + ")";
        };

        /**
         * Collects and formats the fields available on the given message object.
         * @method module:PromenadeStandardItem.PromenadeStandardCommandMessage#collect
         * @public
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

            //if we haven't selected a command, return undefined
            if (!this[root_field]) {
                return undefined;
            }

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

    PromenadeStandardItemCardCommandTabController.$inject = ["$scope", "$mdDialog", "ParlayNotification", "PromenadeStandardCommandMessage", "ParlayWidgetManager"];
    /**
     * Controller constructor for the command tab.
     * @constructor module:PromenadeStandardItem.PromenadeStandardItemCardCommandTabController
     * @param {Object} $scope - AngularJS [$scope]{@link https://docs.angularjs.org/guide/scope} Object.
     * @param {Object} ParlayNotification - [ParlayNotification]{@link module:ParlayNotification.ParlayNotification} service.
     * @param {Object} PromenadeStandardCommandMessage - [PromenadeStandardCommandMessage]{@link module:PromenadeStandardItem.PromenadeStandardCommandMessage} factory.
     */
    function PromenadeStandardItemCardCommandTabController ($scope, $mdDialog, ParlayNotification, PromenadeStandardCommandMessage, ParlayWidgetManager) {

        var ctrl = this;

        ctrl.send = send;
        ctrl.copyCommand = copyCommand;
        ctrl.createButton = createButton;
        ctrl.clearResponses = clearResponses;
        ctrl.toggleCommandBuilder = toggleCommandBuilder;
        ctrl.toggleScriptBuilder = toggleScriptBuilder;
        ctrl.toggleResponseContents = toggleResponseContents;

        ctrl.item = $scope.item;

        // Due to the way JavaScript prototypical inheritance works and AngularJS scoping we want to enclose the message Object within another object.
        // Reference AngularJS "dot rule": http://jimhoskins.com/2012/12/14/nested-scopes-in-angularjs.html
        $scope.wrapper = {
            message: new PromenadeStandardCommandMessage(ctrl.item.name)
        };

        /**
         * References to [$mdChipsController]{@link https://material.angularjs.org/latest/api/directive/mdChips} instances.
         * We want to clear the buffers before the message is collected and sent.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardCommandTabController#chipsControllers
         * @public
         * @type {Array}
         */
        ctrl.chipsControllers = [];

        /**
         * Hold state of command section collapsibles.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardCommandTabController#collapsible_state
         * @public
         * @type {Object}
         */
        ctrl.collapsible_state = {
            command_builder: false,
            script_builder: false,
            response_contents: false
        };

        /**
         * Container for pending responses.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardCommandTabController#responses
         * @public
         * @type {Array}
         */
        ctrl.responses = [];

        // If there is only one field we should automatically assign it's default.
        if (ctrl.item.content_fields && Object.keys(ctrl.item.content_fields).length === 1) {
            Object.keys(ctrl.item.content_fields).forEach(function (key) {
                var default_value = ctrl.item.content_fields[key].options.find(function (option) {
                    return option.name === ctrl.item.content_fields[key].default;
                });

                var item_key = ctrl.item.content_fields[key].msg_key + '_' + ctrl.item.content_fields[key].input;

                $scope.wrapper.message[item_key] = default_value;
            });
        }


        // Watch for new fields to fill with defaults.
        $scope.$watchCollection("wrapper.message", function () {

            var fields = Object.keys($scope.wrapper.message).filter(function (key) {
                // Build an Array with fields that have sub fields.
                try {
                    return $scope.wrapper.message[key] !== undefined && $scope.wrapper.message[key].hasOwnProperty("sub_fields");
                }
                catch (error) {
                    return null;
                }
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
                if (!$scope.wrapper.message[field.msg_key + '_' + field.input] && ['NUMBERS', 'STRINGS', 'ARRAY'].indexOf(field.input) > -1) {
                    $scope.wrapper.message[field.msg_key + '_' + field.input] = field.default.map(prepChip);
                }
                else if ($scope.wrapper.message[field.msg_key + '_' + field.input] === undefined) {
                    $scope.wrapper.message[field.msg_key + '_' + field.input] = field.default;
                }
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

        /**
         * Add received response information to the pending response item and mark response as success.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardCommandTabController#markOk
         * @private
         * @param {Object} response - Response message topics and contents.
         */
        function markOk (response) {
            var pending_response = ctrl.responses.find(function (pending_response) {
                return pending_response.MSG_ID === response.TOPICS.MSG_ID;
            });

            if (pending_response) {
                pending_response.received = true;
                pending_response.message = response;
                pending_response.success = true;
                pending_response.complete = true;
            }
        }

        /**
         * Add received response information to the pending response item and mark response as error.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardCommandTabController#markError
         * @private
         * @param {Object} response - Response message topics and contents.
         */
        function markError (response) {
            var pending_response = ctrl.responses.find(function (pending_response) {
                return pending_response.MSG_ID === response.TOPICS.MSG_ID;
            });

            if (pending_response) {
                pending_response.received = true;
                pending_response.message = response;
                pending_response.success = false;
                pending_response.complete = true;
            }
        }

        /**
         * Add received response information to the pending response item and mark response as incomplete.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardCommandTabController#markProgress
         * @private
         * @param {Object} response - Response message topics and contents.
         */
        function markProgress (response) {
            var pending_response = ctrl.responses.find(function (pending_response) {
                return pending_response.MSG_ID === response.TOPICS.MSG_ID;
            });

            if (pending_response) {
                pending_response.received = true;
                pending_response.message = response;
            }
        }

        /**
         * Collects and sends the command from the form. During this process it will update controller attributes to inform the user the current status.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardCommandTabController#send
         * @public
         * @param {Event} $event - This event's target is used to reference the md-chips element so that we can clear the buffer if available.
         */
        function send ($event) {
            // Push the buffer into the md-chips ng-model
            if ($event) {
                ctrl.chipsControllers.forEach(function (chipsController) {
                    var buffer = chipsController.getChipBuffer();
                    if (buffer !== "") {
                        chipsController.appendChip(buffer);
                        chipsController.resetChipBuffer();
                    }
                });
            }

            // Add a pending response Object.
            ctrl.responses.push({
                received: false,
                complete: false,
                MSG_ID: ctrl.item.getMessageId() + 1,
                message: undefined,
                success: undefined
            });

            // Remove all responses that have been marked complete.
            ctrl.responses = ctrl.responses.filter(function (pending_response) {
                return !pending_response.complete;
            });

            var collected_message = $scope.wrapper.message.collect(false);

            // Request that the item send the collected message.
            // When a response is received mark it as a success, failure, or record it's progress.
            ctrl.item.sendMessage(collected_message).then(markOk, markError, markProgress);
        }

        /**
         * Copy the Python command generated by the form to the clipboard.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardCommandTabController#copyCommand
         * @public
         */
        function copyCommand () {
            var command = $scope.wrapper.message.toPythonStatement();

            if (command) {
                ParlayNotification.show({content: command.copyToClipboard() ?
                    "Command copied to clipboard." : "Copy failed. Check browser compatibility."});
            }
            else {
                ParlayNotification.show({content: "Cannot copy empty command."});
            }

        }

        function createButton() {

            var command = $scope.wrapper.message.toPythonStatement();

            var dialog = $mdDialog.prompt()
                .title("Button Display Name")
                .placeholder("Name")
                .ariaLabel("Name")
                .ok("Create")
                .cancel("Cancel");

            var widget;

            $mdDialog.show(dialog).then(function (name) {
                widget = ParlayWidgetManager.addWidgetByName("promenadeWidgetButton", {
                    name: name,
                    script: command
                });
            });
        }

        /**
         * Clear all pending responses.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardCommandTabController#clearResponses
         * @public
         */
        function clearResponses () {
            ctrl.responses = [];
        }

        /**
         * Toggle between collapsed and expanded.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardCommandTabController#toggleCommandBuilder
         * @public
         */
        function toggleCommandBuilder () {
            ctrl.collapsible_state.command_builder = !ctrl.collapsible_state.command_builder;
        }

        /**
         * Toggle between collapsed and expanded.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardCommandTabController#toggleScriptBuilder
         * @public
         */
        function toggleScriptBuilder () {
            ctrl.collapsible_state.script_builder = !ctrl.collapsible_state.script_builder;
        }

        /**
         * Toggle between collapsed and expanded.
         * @member module:PromenadeStandardItem.PromenadeStandardItemCardCommandTabController#toggleResponseContents
         * @public
         */
        function toggleResponseContents () {
            ctrl.collapsible_state.response_contents = !ctrl.collapsible_state.response_contents;
        }

    }

    /**
     * Directive constructor for PromenadeStandardItemCardCommands.
     * @returns {Object} - AngularJS directive definition Object.
     */
    function PromenadeStandardItemCardCommands () {
        return {
            scope: {
                item: "="
            },
            templateUrl: "../vendor_components/promenade/items/directives/promenade-standard-item-card-commands.html",
            controller: "PromenadeStandardItemCardCommandTabController",
            controllerAs: "ctrl"
        };
    }

    /**
     * Helper directive that records a reference to the $mdChipsController instance of it's child.
     * Allows us to ensure that the buffer of the md-chips element is cleared before sending.
     * @returns {Object} - AngularJS directive definition Object.
     */
    function PromenadeStandardItemCardCommandContainerChipsDirective () {
        return {
            restrict: "A",
            link: function ($scope) {
                // Record reference to controller.
                $scope.chipsControllers.push($scope.$$childHead.$mdChipsCtrl);

                // Remove reference on scope destruction.
                $scope.$on("$destroy", function () {
                    $scope.chipsControllers.splice($scope.chipsControllers.indexOf($scope.$$childHead.$mdChipsCtrl), 1);
                });
            }
        };
    }

    // Unique index for chip objects so that even chips with the same value will be 'unique'.
    var uuid = 0;

    // Per the ECMAScript2015 specification.
    var max_safe_int = 9007199254740990;

    /**
     * Packages $mdChip object for insertion into message.
     * @param {$mdChip} chip - $mdChip Object
     */
    function prepChip (chip) {
        uuid += 1;

        // Wrap around after max safe int
        if (uuid > max_safe_int) {
            uuid = 0;
        }
        return {
            value: chip,
            idx: uuid
        };
    }

    PromenadeStandardItemCardCommandContainerController.$inject = ["$scope", "ParlayItemPersistence", "PromenadeStandardCommandMessage", "ParlayUtility"];
    /**
     * Controller constructor for command container.
     * @constructor module:PromenadeStandardItem.PromenadeStandardItemCardCommandContainerController
     * @param {Object} $scope - AngularJS [$scope]{@link https://docs.angularjs.org/guide/scope} Object.
     * @param {Object} ParlayItemPersistence - [ParlayItemPersistence]{@link module:ParlayItem.ParlayItemPersistence} service.
     * @param {Object} PromenadeStandardCommandMessage - [PromenadeStandardCommandMessage]{@link module:PromenadeStandardItem.PromenadeStandardCommandMessage} factory.
     * @param {Object} ParlayUtility - [ParlayUtility]{@link module:ParlayUtility.ParlayUtility} service.
     */
    function PromenadeStandardItemCardCommandContainerController ($scope, ParlayItemPersistence, PromenadeStandardCommandMessage, ParlayUtility) {
        var container = ParlayUtility.relevantScope($scope, 'container').container;
        var directive_name = 'parlayItemCard.' + container.ref.id.toString().replace(' ', '_') + '_' + container.uid;

        // Request that $scope.wrapper.message is monitored for persistence. Also pass a custom restoration function
        // that will instantiate a PromenadeStandardCommandMessage instead of a JavaScript Object on when the persisted
        // message is restored.
        ParlayItemPersistence.monitor(directive_name, "wrapper.message", $scope, function (value) {
            // Merge the data on $scope.wrapper.message and the persisted data into an empty JavaScript Object.
            var merged_data = angular.merge({}, $scope.wrapper.message, value);
            // Initialize a PromenadeStandardCommandMessage with the merged data.
            return new PromenadeStandardCommandMessage(value.item_name, merged_data);
        });

        // Make the prepChip Function available on the PromenadeStandardItemCardCommandContainer $scope.
        $scope.prepChip = prepChip;

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
         * @returns {(Object|Array)} - the fields sub fields, may be Object or Array.
         */
        $scope.getSubFields = function (field) {
            return $scope.wrapper.message[field.msg_key + '_' + field.input].sub_fields;
        };
    }

    PromenadeStandardItemCardCommandContainer.$inject = ["RecursionHelper"];
    /**
     * Directive constructor for PromenadeStandardItemCardCommandContainer.
     * PromenadeStandardItemCardCommandContainer will recursively construct a form from the given fields.
     *
     * The scope attribute of the directive definition Object contains the following bindings:
     *      wrapper - Contains message Object, the wrapper Object is passed so that the message reference is maintained
     *      through the tree of scopes rather than a copy of the Object.
     *      fields - Object of the fields that should be displayed within the container. If a field contains a subfield,
     *      a PromenadeStandardItemCardCommandContainer will be compiled as a child of this
     *      PromenadeStandardItemCardCommandContainer.
     *      commandform - The HTML form instance, used for validation.
     *      chipsControllers - Array of $mdChips controllers that are collected so that the buffers can be cleared before
     *      sending a message.
     *
     * @param {Object} RecursionHelper - Allows recursive nesting of this directive within itself for sub field support.
     * @returns {Object} - AngularJS directive definition.
     */
    function PromenadeStandardItemCardCommandContainer (RecursionHelper) {
        return {
            scope: {
                wrapper: '=',
                fields: '=',
                commandform: '=',
                chipsControllers: "="
            },
            templateUrl: '../vendor_components/promenade/items/directives/promenade-standard-item-card-command-container.html',
            compile: RecursionHelper.compile,
            controller: "PromenadeStandardItemCardCommandContainerController"
        };
    }

}());