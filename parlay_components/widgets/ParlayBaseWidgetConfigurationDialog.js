(function () {
    "use strict";

    var module_dependencies = ["ui.ace", "parlay.widgets.collection", "parlay.widgets.inputmanager", "parlay.widget.transformer", "parlay.widgets.eventhandler", "parlay.data"];

    angular
        .module("parlay.widgets.base.configuration", module_dependencies)
        .controller("ParlayBaseWidgetConfigurationDialogController", ParlayBaseWidgetConfigurationDialogController)
        .controller("ParlayBaseWidgetConfigurationTemplateController", ParlayBaseWidgetConfigurationTemplateController)
        .controller("ParlayBaseWidgetConfigurationEventController", ParlayBaseWidgetConfigurationEventController)
        .controller("ParlayBaseWidgetConfigurationHandlerController", ParlayBaseWidgetConfigurationHandlerController)
        .controller("ParlayBaseWidgetConfigurationSourceController", ParlayBaseWidgetConfigurationSourceController)
        .controller("ParlayBaseWidgetConfigurationTransformController", ParlayBaseWidgetConfigurationTransformController);

    ParlayBaseWidgetConfigurationDialogController.$inject = ["$scope", "$mdDialog", "configuration", "widgetCompiler"];
    function ParlayBaseWidgetConfigurationDialogController ($scope, $mdDialog, configuration, widgetCompiler) {

        $scope.configuration = configuration;

        this.cancel = function () {
            $mdDialog.cancel();
        };

        this.hide = function () {
            $mdDialog.hide($scope.configuration);
        };

        $scope.$watch("configuration.template", function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                widgetCompiler($scope.configuration.template);
            }
        });

    }

    ParlayBaseWidgetConfigurationTemplateController.$inject = ["ParlayWidgetsCollection"];
    function ParlayBaseWidgetConfigurationTemplateController (ParlayWidgetsCollection) {

        this.getTemplates = function () {
            return ParlayWidgetsCollection.getAvailableWidgets();
        };

    }

    ParlayBaseWidgetConfigurationEventController.$inject = ["$scope", "ParlayWidgetInputManager", "ParlayWidgetEventHandler"];
    function ParlayBaseWidgetConfigurationEventController ($scope, ParlayWidgetInputManager) {

        this.queryEvents = function (query) {
            var lowercase_query = angular.lowercase(query);
            
            return ParlayWidgetInputManager.getEvents().filter(function (event) {
                return (angular.lowercase(event.event) + angular.lowercase(event.element)).includes(lowercase_query);
            });
        };
        
        this.addHandler = function (event) {
            ParlayWidgetInputManager.registerHandler(event);
        };
        
        this.removeHandler = function (event) {
            ParlayWidgetInputManager.deregisterHandler(event);
        };

        $scope.$watch("configuration.template.type", function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (newValue == "input") {
                    $scope.configuration.selectedEvents = [];
                    $scope.$parent.currentTabIndex = 1;
                }
                else if (!!$scope.configuration.selectedEvents) {
                    $scope.configuration.selectedEvents.forEach(function (event) {
                        event.handler.detach();
                    });
                    $scope.configuration.selectedEvents = [];
                }
            }
        });
        
    }

    ParlayBaseWidgetConfigurationHandlerController.$inject = ["ParlayData"];
    function ParlayBaseWidgetConfigurationHandlerController (ParlayData) {

        function items() {
            var iterator = ParlayData.values();
            var values = [];
            for (var current = iterator.next(); !current.done; current = iterator.next()) {
                values.push(current.value);
            }
            return values;
        }

        function generateCompleter() {

            var static_entries = [
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

            return {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    callback(null, items().reduce(function (accumulator, item) {

                        var methods = Object.getOwnPropertyNames(item).filter(function (prop) {
                            return typeof item[prop] == 'function' && item[prop].name != "bound ";
                        }).map(function (prop) {
                            return item[prop];
                        });

                        var entries = methods.map(function (method) {
                            return {
                                caption: item.name + "." + method.name + "()",
                                value: item.name + "." + method.name + "()",
                                meta: "Parlay{" + item.type + "} method"
                            };
                        });

                        entries.push({
                            caption: item.name + ".value",
                            value: item.name + ".value",
                            meta: "Parlay{" + item.type + "} value"
                        });

                        return accumulator.concat(entries);
                    }, static_entries));
                }
            };
        }

        this.onEditorLoad = function (editor) {
            editor.$blockScrolling = Infinity;
            ace.require("ace/ext/language_tools");
            editor.setOptions({enableBasicAutocompletion: true, enableLiveAutocompletion: true});
            editor.completers = [generateCompleter()];
        };

    }

    ParlayBaseWidgetConfigurationSourceController.$inject = ["$scope", "ParlayData", "ParlayWidgetInputManager", "ParlayWidgetTransformer"];
    function ParlayBaseWidgetConfigurationSourceController ($scope, ParlayData, ParlayWidgetInputManager, ParlayWidgetTransformer) {

        function items() {
            var iterator = ParlayData.values();
            var values = [];
            for (var current = iterator.next(); !current.done; current = iterator.next()) {
                values.push(current.value);
            }
            return values;
        }

        this.querySearch = function (query) {

            var lowercase_query = query.toLowerCase();

            var filtered_items = items().filter(function (item) {
                return item.name.indexOf(lowercase_query) > -1 && $scope.configuration.selectedItems.indexOf(item) === -1;
            });

            var filtered_elements = ParlayWidgetInputManager.getElements().filter(function (element) {
                return element.name.indexOf(lowercase_query) > -1 && $scope.configuration.selectedItems.indexOf(element) === -1;
            });

            return filtered_items.concat(filtered_elements);

        };

        this.onAdd = function ($chip) {
            $scope.configuration.transformer.addItem($chip);
        };

        this.onRemove = function ($chip) {
            $scope.configuration.transformer.removeItem($chip);
        };

        $scope.$watch("configuration.template.type", function (newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                if (newValue == "display") {
                    $scope.configuration.selectedItems = [];
                    $scope.configuration.transformer = new ParlayWidgetTransformer();
                    $scope.$parent.currentTabIndex = 2;
                }
                else if (!!$scope.configuration.transformer) {
                    $scope.configuration.transformer.cleanHandlers();
                    $scope.configuration.selectedItems = [];
                }
            }
        });

    }

    ParlayBaseWidgetConfigurationTransformController.$inject = ["$scope"];
    function ParlayBaseWidgetConfigurationTransformController ($scope) {

        function generateCompleter() {
            return {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    callback(null, $scope.configuration.selectedItems.reduce(function (accumulator, item) {
                        return accumulator.concat([{
                            caption: item.name + ".value",
                            value: item.name + ".value",
                            meta: "Parlay{" + item.type + "} value"
                        }]);
                    }, []));
                }
            };
        }

        this.onEditorLoad = function (editor) {
            editor.$blockScrolling = Infinity;
            ace.require("ace/ext/language_tools");
            editor.setOptions({enableBasicAutocompletion: true, enableLiveAutocompletion: true});
            editor.completers = [generateCompleter()];
        };

    }

}());