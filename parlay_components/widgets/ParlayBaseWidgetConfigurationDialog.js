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

    ParlayBaseWidgetConfigurationDialogController.$inject = ["$scope", "$mdDialog", "ParlayWidgetTransformer", "ParlayWidgetEventHandler", "configuration", "template", "container", "widgetCompiler"];
    function ParlayBaseWidgetConfigurationDialogController ($scope, $mdDialog, ParlayWidgetTransformer, ParlayWidgetEventHandler, configuration, template, container, widgetCompiler) {

        $scope.configuration = configuration;

        $scope.wrapper = {
            template: template,
            container: container
        };

        this.cancel = function () {
            $mdDialog.cancel();
        };

        this.hide = function () {
            $mdDialog.hide($scope.configuration);
        };

        $scope.$watch("wrapper.template", function (newValue, oldValue) {
            if (newValue != oldValue) {

                $scope.wrapper.container = widgetCompiler($scope.wrapper.template);

                if (!oldValue || newValue.type != oldValue.type) {
                    if ($scope.wrapper.template.type == "display") {
                        $scope.configuration.selectedItems = [];
                        $scope.configuration.transformer = new ParlayWidgetTransformer();

                        if (!!$scope.configuration.handlers) {
                            $scope.configuration.handlers.forEach(function (handler) {
                                handler.detach();
                            });
                            $scope.configuration.handlers = [];
                        }

                    }
                    else if ($scope.wrapper.template.type == "input") {
                        $scope.configuration.selectedEvents = [];
                        $scope.configuration.handlers = [];

                        if (!!$scope.configuration.transformer) {
                            $scope.configuration.transformer.cleanHandlers();
                        }

                        $scope.configuration.selectedItems = [];
                    }
                }

            }
        });

    }

    ParlayBaseWidgetConfigurationTemplateController.$inject = ["$scope", "ParlayWidgetsCollection"];
    function ParlayBaseWidgetConfigurationTemplateController ($scope, ParlayWidgetsCollection) {

        this.getTemplates = function () {
            return ParlayWidgetsCollection.getAvailableWidgets();
        };

    }

    ParlayBaseWidgetConfigurationEventController.$inject = ["$scope", "ParlayWidgetInputManager", "ParlayWidgetEventHandler"];
    function ParlayBaseWidgetConfigurationEventController ($scope, ParlayWidgetInputManager, ParlayWidgetEventHandler) {

        this.getEvents = function () {
            return $scope.wrapper.template ? ParlayWidgetInputManager.getElements().reduce(function (accumulator, current) {
                return accumulator.concat(Object.keys(current.events).map(function (key) {
                    current.events[key].element = current.name;
                    return current.events[key];
                }));
            }, []) : [];
        };

        $scope.$watchCollection("configuration.selectedEvents", function (newValue, oldValue) {

            if (!!newValue && newValue.length > 0) {

                var newEvent = newValue.find(function (newEvent) {
                    return !oldValue.some(function (oldEvent) {
                        return newEvent === oldEvent;
                    });
                });

                $scope.configuration.handlers.push(new ParlayWidgetEventHandler(newEvent));

                var old_handlers = $scope.configuration.handlers.filter(function (handler) {
                    return !newValue.some(function (event) { return handler.event === event; });
                });

                old_handlers.forEach(function (handler) {
                    handler.detach();
                });

                $scope.configuration.handlers = $scope.configuration.handlers.filter(function (handler) {
                    return old_handlers.indexOf(handler) === -1;
                });
            }

        });

    }

    ParlayBaseWidgetConfigurationHandlerController.$inject = ["$scope", "ParlayData"];
    function ParlayBaseWidgetConfigurationHandlerController ($scope, ParlayData) {

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

    ParlayBaseWidgetConfigurationSourceController.$inject = ["$scope", "ParlayData", "ParlayWidgetInputManager"];
    function ParlayBaseWidgetConfigurationSourceController ($scope, ParlayData, ParlayWidgetInputManager) {

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

        this.change = function (item) {
            if (!!item && item.type == "datastream") {
                item.listen(false);
            }
            else if (!!item && item.type == "property") {
                item.get();
            }
        };

        this.onAdd = function ($chip) {
            $scope.configuration.transformer.addItem($chip);
        };

        this.onRemove = function ($chip) {
            $scope.configuration.transformer.removeItem($chip);
        };

    }

    ParlayBaseWidgetConfigurationTransformController.$inject = ["$scope", "ParlayData", "ParlayWidgetTransformer"];
    function ParlayBaseWidgetConfigurationTransformController ($scope, ParlayData, ParlayWidgetTransformer) {

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