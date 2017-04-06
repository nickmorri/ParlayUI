(function () {
    "use strict";

    var module_dependencies = ["ui.ace", "mdColorPicker", "parlay.widget.manager", "parlay.widget.collection", "parlay.widget.inputmanager",
        "parlay.widget.transformer", "parlay.widget.eventhandler", "parlay.data", "parlay.utility"];

    angular
        .module("parlay.widget.base.configuration", module_dependencies)
        .controller("ParlayWidgetBaseConfigurationDialogController", ParlayWidgetBaseConfigurationDialogController)
        .controller("ParlayWidgetBaseConfigurationTemplateController", ParlayWidgetBaseConfigurationTemplateController)
        .controller("ParlayWidgetBaseConfigurationEventController", ParlayWidgetBaseConfigurationEventController)
        .controller("ParlayWidgetBaseConfigurationHandlerController", ParlayWidgetBaseConfigurationHandlerController)
        .controller("ParlayWidgetBaseConfigurationSourceController", ParlayWidgetBaseConfigurationSourceController)
        .controller("ParlayWidgetBaseConfigurationTransformController", ParlayWidgetBaseConfigurationTransformController)
        .controller("ParlayWidgetBaseConfigurationApiHelperController", ParlayWidgetBaseConfigurationApiHelperController)
        .controller("ParlayWidgetBaseConfigurationCustomizationController", ParlayWidgetBaseConfigurationCustomizationController)
        .directive("parlayWidgetBaseConfigurationTemplate", ParlayWidgetBaseConfigurationTemplateDirective)
        .directive("parlayWidgetBaseConfigurationEvent", ParlayWidgetBaseConfigurationEventDirective)
        .directive("parlayWidgetBaseConfigurationHandler", ParlayWidgetBaseConfigurationHandlerDirective)
        .directive("parlayWidgetBaseConfigurationTransform", ParlayWidgetBaseConfigurationTransformDirective)
        .directive("parlayWidgetBaseConfigurationApiHelper", ParlayWidgetBaseConfigurationApiHelperDirective)
        .directive("parlayWidgetBaseConfigurationSource", ParlayWidgetBaseConfigurationSourceDirective)
        .directive("parlayWidgetBaseConfigurationCustomization", ParlayWidgetBaseConfigurationCustomizationDirective)
        .directive("tabCompiler", tabCompiler);

    tabCompiler.$inject = ["$compile"];
    /**
     * Used to compile customization configuration tab bodies. [widgetRegistration]{@link module:ParlayWidget#widgetRegistration}
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

    ParlayWidgetBaseConfigurationDialogController.$inject = ["$scope", "$mdDialog", "item"];
    /**
     * Base [$mdDialog]{@link https://material.angularjs.org/latest/api/service/$mdDialog} widget configuration controller.
     * @constructor module:ParlayWidget.ParlayWidgetBaseConfigurationDialogController
     * @param {Object} $scope - AngularJS [$scope]{@link https://docs.angularjs.org/guide/scope} Object.
     * @param {Object} $mdDialog - Angular Material [$mdDialog]{@link https://material.angularjs.org/latest/api/service/$mdDialog} service.
     * @param {Object} configuration - Holds user selected configuration details used to define behavior and appearence
     * of the widget.
     * @param {Function} widgetCompiler - [widgetCompiler]{@link module:ParlayWidget.ParlayWidgetBase#compileWrapper}
     */
    function ParlayWidgetBaseConfigurationDialogController ($scope, $mdDialog, item) {

        var ctrl = this;

        // Attaches the configuration Object to the $scope Object to allow for user configuration.
        // Accessible by all the dialog controllers in the dialog.
        $scope.configuration = item.configuration;
        $scope.item = item; //attach the item too for more information

        // Attach $mdDialog controls to controller.
        ctrl.cancel = $mdDialog.cancel;
        ctrl.hide = $mdDialog.hide;
    }

    ParlayWidgetBaseConfigurationTemplateController.$inject = ["ParlayWidgetCollection"];
    /**
     * Manages the user selection of templates.
     * @constructor module:ParlayWidget.ParlayWidgetBaseConfigurationTemplateController
     * @param {Object} ParlayWidgetCollection - [ParlayWidgetCollection]{@link module:ParlayWidget.ParlayWidgetCollection} service.
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

    ParlayWidgetBaseConfigurationEventController.$inject = ["$scope", "ParlayWidgetInputManager", "ParlayWidgetManager"];
    /**
     * Manages the user selection of widget events.
     * @constructor module:ParlayWidget.ParlayWidgetBaseConfigurationEventController
     * @param {Object} $scope - AngularJS [$scope]{@link https://docs.angularjs.org/guide/scope} Object.
     * @param {Object} ParlayWidgetInputManager - [ParlayWidgetInputManager]{@link module:ParlayWidget.ParlayWidgetInputManager} service.
     */
    function ParlayWidgetBaseConfigurationEventController ($scope, ParlayWidgetInputManager, ParlayWidgetManager) {

        var ctrl = this;

        // Attach methods to controller.
        ctrl.queryEvents = queryEvents;
        ctrl.addHandler = addHandler;
        ctrl.removeHandler = removeHandler;
        //Proxy the rquest to the ParlayWidgetManager. This is so directives can call it
        ctrl.getActiveWidget = function(uid) { return ParlayWidgetManager.getActiveWidget(uid);} ;

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
            //the uid for the current widget
            var uid = $scope.item.uid;

            return ParlayWidgetInputManager.getEvents().filter(function (event) {
                //only show events for the current widget
                if(event.element.uid != uid) return false;
                var lowercase = angular.lowercase(event.event);
                //only show event matching our query (case insensitive)
                return (lowercase).includes(lowercase_query) &&
                    $scope.configuration.selectedEvents.indexOf(event) === -1;
            });

        }

        // var availableEvents = queryEvents("");
        // if (availableEvents.length > 0 && $scope.configuration.selectedEvents.length === 0) {
        //     $scope.configuration.selectedEvents.push(availableEvents[0]);
        //     addHandler(availableEvents[0]);
        // }

        // When configuration.template.type change the currentTabIndex.
        $scope.$watch("configuration.template.type", function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (newValue == "input") {
                    $scope.configuration.selectedEvents = [];
                    $scope.currentTabIndex = 0;
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

        var static_completer_entries = [];

        /**
         * Creates Object of an [Ace editor]{@link https://ace.c9.io/} auto completer that pulls entries from ParlayData.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationHandlerController#generateCompleter
         * @private
         * @param {Array} initial_entries - Entries that should be included explicitly.
         * @returns {Object} - [Ace editor]{@link https://ace.c9.io/} auto completer.
         */
        function generateCompleter (initial_entries) {
            return {
                getCompletions: function (editor, session, pos, prefix, callback) {

                    var entries = [];
                    var editor_text = editor.getValue();

                    ParlayData.forEach(function (value) {
                        //if this value has an autocomplete entry then generate it
                        if(!!value.generateAutocompleteEntries)
                        {
                            var my_entries = value.generateAutocompleteEntries();
                            // filter based on dependson if any defne it
                            my_entries = my_entries.filter(function(val){
                                return !val.depends_on || editor_text.indexOf(val.depends_on) !=-1;
                            });


                            entries = entries.concat(my_entries);
                        }
                    });

                    entries = entries.concat(initial_entries);

                    callback(null, entries);
                }
            };
        }

        /**
         * Called when the [Ace editor]{@link https://ace.c9.io/} instance completes loading.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationHandlerController#onEditorLoad
         * @public
         * @param {Object} editor - [Ace editor]{@link https://ace.c9.io/} instance.
         */
        function onEditorLoad (editor) {
            editor.$blockScrolling = Infinity;
            ace.require("ace/ext/language_tools");
            editor.setOptions({enableBasicAutocompletion: true, enableLiveAutocompletion: true});
            editor.completers = editor.completers.concat([generateCompleter(static_completer_entries)]);

        }

    }

    ParlayWidgetBaseConfigurationSourceController.$inject = ["$scope", "ParlayData", "ParlayWidgetTransformer"];
    /**
     * Manages the user selection of data sources.
     * @constructor module:ParlayWidget.ParlayWidgetBaseConfigurationSourceController
     * @param {Object} $scope - AngularJS [$scope]{@link https://docs.angularjs.org/guide/scope} Object.
     * @param {Object} ParlayData - [ParlayData]{@link module:ParlayData} service.
     * @param {Object} ParlayWidgetInputManager - [ParlayWidgetInputManager]{@link module:ParlayWidget.ParlayWidgetInputManager} service.
     * @param {Object} ParlayWidgetTransformer - [ParlayWidgetTransformer]{@link module:ParlayWidget.ParlayWidgetTransformer} service.
     */
    function ParlayWidgetBaseConfigurationSourceController ($scope, ParlayData, ParlayWidgetTransformer) {

        var ctrl = this;

        // Attach methods to controller.
        ctrl.querySearch = querySearch;
        ctrl.onAdd = onAdd;
        ctrl.onRemove = onRemove;

        /**
         * Collects items register with [ParlayData]{@link module:ParlayData}.
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
         * Filter items and input elements registered with [ParlayData]{@link module:ParlayData} and
         * [ParlayWidgetInputManager]{@link module:ParlayWidget.ParlayWidgetInputManager}.
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
            /* TODO: Add ability for transformer widgets to be able totake input from input widgets
             var filtered_elements = ParlayWidgetInputManager.getElements().filter(function (element) {
             return element.element_name.indexOf(lowercase_query) > -1 &&  $scope.configuration.selectedItems.indexOf(element) === -1;
             });*/

            return filtered_items;//.concat(filtered_elements);
        }

        /**
         * [$mdChips]{@link https://material.angularjs.org/latest/api/directive/mdChips} onAdd event handler.
         * Adds $chip item to the [ParlayWidgetTransformer]{@link module:ParlayWidget.ParlayWidgetTransformer} in the
         * configuration.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationSourceController#onAdd
         * @public
         * @param {Object} $chip - Angular Material [$mdChip]{@link https://material.angularjs.org/latest/api/directive/mdChips} instance.
         */
        function onAdd ($chip) {
            $scope.configuration.transformer.addItem($chip);
        }

        /**
         * [$mdChips]{@link https://material.angularjs.org/latest/api/directive/mdChips} onRemove event handler.
         * Removes $chip item from the [ParlayWidgetTransformer]{@link module:ParlayWidget.ParlayWidgetTransformer}
         * in the configuration.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationSourceController#onRemove
         * @public
         * @param {Object} $chip - Angular Material [$mdChip]{@link https://material.angularjs.org/latest/api/directive/mdChips} instance.
         */
        function onRemove ($chip) {
            $scope.configuration.transformer.removeItem($chip);
        }
    }

    ParlayWidgetBaseConfigurationTransformController.$inject = [];
    /**
     * Manages the transformations of user selected data sources.
     * @constructor module:ParlayWidget.ParlayWidgetBaseConfigurationTransformController
     * @param {Object} $scope - AngularJS [$scope]{@link https://docs.angularjs.org/guide/scope} Object.
     */
    function ParlayWidgetBaseConfigurationTransformController () {

        var ctrl = this;

        // Attach methods to controller.
        ctrl.onEditorLoad = onEditorLoad;

        /**
         * Called when the [Ace editor]{@link https://ace.c9.io/} instance completes loading.
         * @member module:ParlayWidget.ParlayWidgetBaseConfigurationTransformController#onEditorLoad
         * @public
         * @param {Object} editor - [Ace editor]{@link https://ace.c9.io/} instance.
         */
        function onEditorLoad (editor) {
            editor.$blockScrolling = Infinity;
            ace.require("ace/ext/language_tools");
            editor.setOptions({enableBasicAutocompletion: true, enableLiveAutocompletion: true});
            //editor.completers = [generateCompleter(static_completer_entries)];
        }

    }

    ParlayWidgetBaseConfigurationApiHelperController.$inject = ["$scope", "$timeout"];
    /**
     * Managers the api helper tab of the edit menu
     * @constructor module:ParlayWidget.ParlayWidgetBaseConfigurationTransformController
     */
    function ParlayWidgetBaseConfigurationApiHelperController($scope, $timeout) {
        var ctrl = this;
        ctrl.onEditorLoad = onEditorLoad;
        ctrl.sampleScript = "";


        $scope.$watch(function() {
            // Every time the display name changes, we should update the script
            $scope.$$postDigest(function(){
                var displayed_name = $scope.$parent.item.name;
                var base_script = $scope.$parent.configuration.template.api_helper.property;
                ctrl.sampleScript = base_script.split("{name}").join("\"" + displayed_name + "\"");
            });
        });

        function onEditorLoad(editor) {
            editor.$blockScrolling = Infinity;
            ace.require("ace/ext/language_tools");
            editor.setReadOnly(true);
        }
    }

    ParlayWidgetBaseConfigurationCustomizationController.$inject = ["$scope", "ParlayUtility", "$timeout"];
    function ParlayWidgetBaseConfigurationCustomizationController ($scope, ParlayUtility, $timeout) {

        this.uploadImageFile = uploadImageFile;
        this.imageFileChanged = imageFileChanged;

        function uploadImageFile(event) {
            $timeout(function(){
                event.target.parentElement.getElementsByTagName("input")[0].click();
            });
        }

        function imageFileChanged (event) {
            // Instantiate FileReader object
            var fileReader = new FileReader();

            fileReader.addEventListener("load", function() {
                $scope.customizations.image.src = fileReader.result;
            });

            fileReader.readAsDataURL(event.target.files[0]);
        }

    }

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

    function ParlayWidgetBaseConfigurationApiHelperDirective() {
        return {
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-api-helper.html",
            controller: "ParlayWidgetBaseConfigurationApiHelperController",
            controllerAs: "apiHelperCtrl"
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
                customizations: "=",
                item: "="
            },
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-customization.html",
            controller: "ParlayWidgetBaseConfigurationCustomizationController",
            controllerAs: "customizationCtrl"
        };
    }

}());