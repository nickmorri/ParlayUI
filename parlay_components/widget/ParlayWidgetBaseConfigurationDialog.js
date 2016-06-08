(function () {
    "use strict";

    var module_dependencies = ["ui.ace", "mdColorPicker", "parlay.widget.collection", "parlay.widget.inputmanager", "parlay.widget.transformer", "parlay.widget.eventhandler", "parlay.data"];

    angular
        .module("parlay.widget.base.configuration", module_dependencies)
        .controller("ParlayWidgetBaseConfigurationDialogController", ParlayWidgetBaseConfigurationDialogController)
        .controller("ParlayWidgetBaseConfigurationTemplateController", ParlayWidgetBaseConfigurationTemplateController)
        .controller("ParlayWidgetBaseConfigurationEventController", ParlayWidgetBaseConfigurationEventController)
        .controller("ParlayWidgetBaseConfigurationHandlerController", ParlayWidgetBaseConfigurationHandlerController)
        .controller("ParlayWidgetBaseConfigurationSourceController", ParlayWidgetBaseConfigurationSourceController)
        .controller("ParlayWidgetBaseConfigurationTransformController", ParlayWidgetBaseConfigurationTransformController)
        .controller("ParlayWidgetBaseConfigurationCustomizationController", ParlayWidgetBaseConfigurationTransformController)
        .directive("parlayWidgetBaseConfigurationTemplate", ParlayWidgetBaseConfigurationTemplateDirective)
        .directive("parlayWidgetBaseConfigurationEvent", ParlayWidgetBaseConfigurationEventDirective)
        .directive("parlayWidgetBaseConfigurationHandler", ParlayWidgetBaseConfigurationHandlerDirective)
        .directive("parlayWidgetBaseConfigurationTransform", ParlayWidgetBaseConfigurationTransformDirective)
        .directive("parlayWidgetBaseConfigurationSource", ParlayWidgetBaseConfigurationSourceDirective)
        .directive("parlayWidgetBaseConfigurationCustomization", ParlayWidgetBaseConfigurationCustomizationDirective)
        .directive("tabCompiler", tabCompiler);

    tabCompiler.$inject = ["$compile"];
    /**
     * Used to compile customization configuration tab bodies. @see [widgetRegistration]{@link module:ParlayWidget#widgetRegistration}
     * for more information.
     *
     * @member module:ParlayWidget.ParlayWidgetBaseConfigurationDialogController#tabCompiler
     * @private
     */
    function tabCompiler ($compile) {
        return function (scope, element, attributes) {
            scope.$watch(function (scope) {
                return scope.$eval(attributes.tabCompiler);
            }, function (value) {
                var element_tag = value.snakeCase();
                element.html(["<", element_tag, " ", "customizations='configuration.customizations'", "></", element_tag, ">"].join(""));
                $compile(element.contents())(scope);
            });
        };
    }

    ParlayWidgetBaseConfigurationDialogController.$inject = ["$scope", "$mdDialog", "configuration", "widgetCompiler"];
    /**
     * Base $mdDialog widget configuration controller.
     * @constructor module:ParlayWidget.ParlayWidgetBaseConfigurationDialogController
     * @param {Object} $scope - AngularJS $scope Object.
     * @param {Object} $mdDialog - Angular Material service.
     * @param {Object} configuration - Holds user selected configuration details used to define behavior and appearence
     * of the widget.
     * @param {Function} widgetCompiler - @see {@link module:ParlayWidget.ParlayWidgetBase#compileWrapper}
     */
    function ParlayWidgetBaseConfigurationDialogController ($scope, $mdDialog, configuration, widgetCompiler) {

        var ctrl = this;

        // Attaches the configuration Object to the $scope Object to allow for user configuration.
        // Accessible by all the dialog controllers in the dialog.
        $scope.configuration = configuration;

        // Attach methods to controller.
        ctrl.cancel = cancel;
        ctrl.hide = hide;

        function cancel () {
            $mdDialog.cancel();
        }

        function hide () {
            $mdDialog.hide();
        }
        // Attach $mdDialog controls to controller.
        ctrl.cancel = $mdDialog.cancel;
        ctrl.hide = $mdDialog.hide;

        // When the configuration.template changes compile the widget template.
        $scope.$watch("configuration.template", function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                widgetCompiler($scope.configuration.template);
            }
        });

    }

    ParlayWidgetBaseConfigurationTemplateController.$inject = ["ParlayWidgetCollection"];
    /**
     * Manages the user selection of templates.
     * @constructor module:ParlayWidget.ParlayWidgetBaseConfigurationTemplateController
     * @param {Object} ParlayWidgetCollection - ParlayWidgetCollection service.
     */
    function ParlayWidgetBaseConfigurationTemplateController (ParlayWidgetCollection) {

        var ctrl = this;

        // Attach methods to controller.
        ctrl.getTemplates = getTemplates;

        /**
         * Retrieves available templates from the widget collection.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationTemplateController#getTemplates
         * @public
         * @returns {Array} - available templates.
         */
        function getTemplates () {
            return ParlayWidgetCollection.getAvailableWidgets();
        }

    }

    ParlayWidgetBaseConfigurationEventController.$inject = ["$scope", "ParlayWidgetInputManager"];
    /**
     * Manages the user selection of widget events.
     * @constructor module:ParlayWidget.ParlayWidgetBaseConfigurationEventController
     * @param {Object} $scope - AngularJS $scope Object.
     * @param {Object} ParlayWidgetInputManager - ParlayWidgetInputManager service.
     */
    function ParlayWidgetBaseConfigurationEventController ($scope, ParlayWidgetInputManager) {

        var ctrl = this;

        // Attach methods to controller.
        ctrl.queryEvents = queryEvents;
        ctrl.addHandler = addHandler;
        ctrl.removeHandler = removeHandler;

        /**
         * Attaches [ParlayWidgetEventHandler]{@link module:ParlayWidget.ParlayWidgetEventHandler} to event.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationEventController#addHandler
         * @public
         * @param {Object} event - Container of input event data.
         */
        function addHandler (event) {
            ParlayWidgetInputManager.registerHandler(event);
        }

        /**
         * Detaches [ParlayWidgetEventHandler]{@link module:ParlayWidget.ParlayWidgetEventHandler} from event.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationEventController#removeHandler
         * @public
         * @param {Object} event - Container of input event data.
         */
        function removeHandler (event) {
            ParlayWidgetInputManager.deregisterHandler(event);
        }

        /**
         * Collect all events that match the given query String.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationEventController#queryEvents
         * @public
         * @param {String} query - Text used to filer the inputs by.
         * @returns {Array} - Events that match the query.
         */
        function queryEvents (query) {
            var lowercase_query = angular.lowercase(query);

            return ParlayWidgetInputManager.getEvents().filter(function (event) {
                var lowercase = angular.lowercase(event.event + event.element.element_name + event.element.widget_name);
                return (lowercase).includes(lowercase_query) &&
                    $scope.configuration.selectedEvents.indexOf(event) === -1;
            });
        }

        // When configuration.template.type change the currentTabIndex.
        $scope.$watch("configuration.template.type", function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (newValue == "input") {
                    $scope.configuration.selectedEvents = [];
                    $scope.currentTabIndex = 1;
                }
                else if (!!$scope.configuration.selectedEvents) {
                    $scope.configuration.selectedEvents.forEach(function (event) {
                        event.handler.detach();
                    });
                    $scope.configuration.selectedEvents = [];
                }
            }
        });

        // When configuration.template changes ensure that configuration is in an appropriate state
        // for the new value if events have been selected.
        $scope.$watch("configuration.template.name", function (newValue, oldValue) {
            if (!!oldValue && !angular.equals(newValue, oldValue) && !!$scope.configuration.selectedEvents) {
                $scope.configuration.selectedEvents.forEach(function (event) {
                    event.handler.detach();
                });
                $scope.configuration.selectedEvents = [];
            }
        });

    }

    ParlayWidgetBaseConfigurationHandlerController.$inject = ["ParlayData"];
    /**
     * Manages the event handling of user selected widget events.
     * @constructor module:ParlayWidget.ParlayWidgetBaseConfigurationHandlerController
     * @param {Object} ParlayData - [ParlayData]{@link module:ParlayData} service.
     */
    function ParlayWidgetBaseConfigurationHandlerController (ParlayData) {

        var ctrl = this;

        // Attach methods to controller.
        ctrl.onEditorLoad = onEditorLoad;

        var static_completer_entries = [
            {
                caption: "ParlaySocket.sendMessage",
                value: "ParlaySocket.sendMessage({}, {})"
            },
            {
                caption: "log",
                value: 'log("hello world")',
                meta: "console.log"
            },
            {
                caption: "alert",
                value: 'alert("hello world")',
                meta: "window.alert"
            },
            {
                caption: "event",
                value: "event",
                meta: "JavaScript event"
            }
        ];

        /**
         * Creates Object of an Ace editor auto completer that pulls entries from ParlayData.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationHandlerController#generateCompleter
         * @private
         * @param {Array} initial_entries - Entries that should be included explicitly.
         * @returns {Object} - Ace editor auto completer.
         */
        function generateCompleter (initial_entries) {
            return {
                getCompletions: function (editor, session, pos, prefix, callback) {

                    var entries = [];

                    ParlayData.forEach(function (value) {
                        entries = entries.concat(value.generateAutocompleteEntries());
                    });

                    entries = entries.concat(initial_entries);

                    callback(null, entries);
                }
            };
        }

        /**
         * Called when the Ace editor instance completes loading.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationHandlerController#onEditorLoad
         * @public
         * @param {Object} editor - Ace editor instance.
         */
        function onEditorLoad (editor) {
            editor.$blockScrolling = Infinity;
            ace.require("ace/ext/language_tools");
            editor.setOptions({enableBasicAutocompletion: true, enableLiveAutocompletion: true});
            editor.completers = [generateCompleter(static_completer_entries)];
        }

    }

    ParlayWidgetBaseConfigurationSourceController.$inject = ["$scope", "ParlayData", "ParlayWidgetInputManager", "ParlayWidgetTransformer"];
    /**
     * Manages the user selection of data sources.
     * @constructor module:ParlayWidget.ParlayWidgetBaseConfigurationSourceController
     * @param {Object} $scope - AngularJS $scope Object.
     * @param {Object} ParlayData - [ParlayData]{@link module:ParlayData} service.
     * @param {Object} ParlayWidgetInputManager - [ParlayWidgetInputManager]{@link module:ParlayWidget.ParlayWidgetInputManager} service.
     * @param {Object} ParlayWidgetTransformer - [ParlayWidgetTransformer]{@link module:ParlayWidget.ParlayWidgetTransformer} service.
     */
    function ParlayWidgetBaseConfigurationSourceController ($scope, ParlayData, ParlayWidgetInputManager, ParlayWidgetTransformer) {

        var ctrl = this;

        // Attach methods to controller.
        ctrl.querySearch = querySearch;
        ctrl.onAdd = onAdd;
        ctrl.onRemove = onRemove;

        /**
         * Collects items register with ParlayData.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationSourceController#items
         * @private
         * @returns {Array} - All available items registered with ParlayData.
         */
        function items () {
            var iterator = ParlayData.values();
            var values = [];
            for (var current = iterator.next(); !current.done; current = iterator.next()) {
                values.push(current.value);
            }
            return values;
        }

        /**
         * Filter items and input elements registered with ParlayData and ParlayWidgetInputManager.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationSourceController#querySearch
         * @public
         * @param {String} query - Text used to filter the data sources by.
         * @returns {Object[]} - Array of filtered data sources.
         */
        function querySearch (query) {
            var lowercase_query = query.toLowerCase();

            var filtered_items = items().filter(function (item) {
                return (
                    ["property", "datastream"].indexOf(item.type) !== -1 &&
                    item.name.indexOf(lowercase_query) > -1 &&
                    $scope.configuration.selectedItems.indexOf(item) === -1
                );
            });

            var filtered_elements = ParlayWidgetInputManager.getElements().filter(function (element) {
                return element.element_name.indexOf(lowercase_query) > -1 && $scope.configuration.selectedItems.indexOf(element) === -1;
            });

            return filtered_items.concat(filtered_elements);
        }

        /**
         * $mdChips onAdd event handler. Adds $chip item to the [ParlayWidgetTransformer]{@link module:ParlayWidget.ParlayWidgetTransformer}
         * in the configuration.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationSourceController#onAdd
         * @public
         * @param {Object} $chip - Angular Material [$mdChip]{@link https://material.angularjs.org/latest/api/directive/mdChips} instance.
         */
        function onAdd ($chip) {
            $scope.configuration.transformer.addItem($chip);
        }

        /**
         * $mdChips onRemove event handler. Removes $chip item from the [ParlayWidgetTransformer]{@link module:ParlayWidget.ParlayWidgetTransformer}
         * in the configuration.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationSourceController#onRemove
         * @public
         * @param {Object} $chip - Angular Material [$mdChip]{@link https://material.angularjs.org/latest/api/directive/mdChips} instance.
         */
        function onRemove ($chip) {
            $scope.configuration.transformer.removeItem($chip);
        }

        // When the configuration.template.type changes to display prepare the configuration Object and switch tabs.
        // If the type changes to anything else we should clear the transformer's handlers if it has any.
        $scope.$watch("configuration.template.type", function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (newValue == "display") {
                    $scope.configuration.selectedItems = [];
                    $scope.configuration.transformer = new ParlayWidgetTransformer();
                    $scope.currentTabIndex = 2;
                }
                else if (!!$scope.configuration.transformer) {
                    $scope.configuration.transformer.cleanHandlers();
                    $scope.configuration.selectedItems = [];
                }
            }
        });

    }

    ParlayWidgetBaseConfigurationTransformController.$inject = ["$scope"];
    /**
     * Manages the transformations of user selected data sources.
     * @constructor module:ParlayWidget.ParlayWidgetBaseConfigurationTransformController
     * @param {Object} $scope - AngularJS $scope Object.
     */
    function ParlayWidgetBaseConfigurationTransformController ($scope) {

        var ctrl = this;

        // Attach methods to controller.
        ctrl.onEditorLoad = onEditorLoad;

        var static_completer_entries = [];

        /**
         * Creates Object of an Ace editor auto completer that pulls entries from configuration.selectedItems.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationTransformController#generateCompleter
         * @private
         * @param {Array} initial_entries - Entries that should be included explicitly.
         * @returns {Object} - Ace editor auto completer.
         */
        function generateCompleter (initial_entries) {
            return {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    callback(null, $scope.configuration.selectedItems.reduce(function (accumulator, item) {
                        return accumulator.concat([{
                            caption: item.item_name + "." + item.name + ".value",
                            value: item.item_name + "." + item.name + ".value",
                            meta: "Parlay{" + item.type + "} value"
                        }]);
                    }, initial_entries));
                }
            };
        }

        /**
         * Called when the Ace editor instance completes loading.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationTransformController#onEditorLoad
         * @public
         * @param {Object} editor - Ace editor instance.
         */
        function onEditorLoad (editor) {
            editor.$blockScrolling = Infinity;
            ace.require("ace/ext/language_tools");
            editor.setOptions({enableBasicAutocompletion: true, enableLiveAutocompletion: true});
            editor.completers = [generateCompleter(static_completer_entries)];
        }

    }

    ParlayWidgetBaseConfigurationCustomizationController.$inject = ["$scope"];
    function ParlayWidgetBaseConfigurationCustomizationController ($scope) {}

    function ParlayWidgetBaseConfigurationTemplateDirective () {
        return {
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-template.html",
            controller: "ParlayWidgetBaseConfigurationTemplateController",
            controllerAs: "templateCtrl"
        };
    }

    function ParlayWidgetBaseConfigurationEventDirective () {
        return {
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-event.html",
            controller: "ParlayWidgetBaseConfigurationEventController",
            controllerAs: "eventCtrl"
        };
    }

    function ParlayWidgetBaseConfigurationHandlerDirective () {
        return {
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-handler.html",
            controller: "ParlayWidgetBaseConfigurationHandlerController",
            controllerAs: "handlerCtrl"
        };
    }

    function ParlayWidgetBaseConfigurationTransformDirective () {
        return {
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-transform.html",
            controller: "ParlayWidgetBaseConfigurationTransformController",
            controllerAs: "transformCtrl"
        };
    }

    function ParlayWidgetBaseConfigurationSourceDirective () {
        return {
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-source.html",
            controller: "ParlayWidgetBaseConfigurationSourceController",
            controllerAs: "sourceCtrl"
        };
    }

    function ParlayWidgetBaseConfigurationCustomizationDirective () {
        return {
            scope: {
                customizations: "="
            },
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-customization.html",
            controller: "ParlayWidgetBaseConfigurationCustomizationController",
            controllerAs: "customizationCtrl"
        };
    }

}());