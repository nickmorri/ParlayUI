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

    ParlayBaseWidgetConfigurationDialogController.$inject = ["$scope", "$mdDialog", "ParlayWidgetTransformer", "ParlayWidgetEventHandler", "configuration", "template", "widgetCompiler"];
    function ParlayBaseWidgetConfigurationDialogController ($scope, $mdDialog, ParlayWidgetTransformer, ParlayWidgetEventHandler, configuration, template, widgetCompiler) {

        $scope.configuration = configuration;

        $scope.wrapper = {
            template: template
        };

        this.cancel = function () {
            $mdDialog.cancel();
        };

        this.hide = function () {
            $mdDialog.hide($scope.configuration);
        };

        $scope.$watch("wrapper.template", function (newValue, oldValue) {
            if (newValue != oldValue) {

                widgetCompiler($scope.wrapper.template);

                if (!oldValue || newValue.type != oldValue.type) {
                    if ($scope.wrapper.template.type == "display") {
                        $scope.configuration.selectedItems = [];
                        $scope.configuration.transformer = new ParlayWidgetTransformer();

                        if (!!$scope.configuration.handler) {
                            $scope.configuration.handler.detach();
                            $scope.configuration.handler = undefined;
                        }

                    }
                    else if ($scope.wrapper.template.type == "input") {
                        $scope.configuration.selectedEvent = undefined;

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

    ParlayBaseWidgetConfigurationEventController.$inject = ["$scope", "ParlayWidgetInputManager"];
    function ParlayBaseWidgetConfigurationEventController ($scope, ParlayWidgetInputManager) {

        this.getEvents = function () {

            var element;

            if ($scope.wrapper.template) {
                element = ParlayWidgetInputManager.getElements().find(function (element) {
                    return element.name.indexOf($scope.wrapper.template.name) > -1;
                });
            }

            return !!element ? element.events : [];
        };

    }

    ParlayBaseWidgetConfigurationHandlerController.$inject = ["$scope", "ParlayData", "ParlayWidgetEventHandler"];
    function ParlayBaseWidgetConfigurationHandlerController ($scope, ParlayData, ParlayWidgetEventHandler) {

        function items() {
            var iterator = ParlayData.values();
            var values = [];
            for (var current = iterator.next(); !current.done; current = iterator.next()) {
                values.push(current.value);
            }
            return values;
        }

        function generateCompleter() {
            return {
                getCompletions: function (editor, session, pos, prefix, callback) {
                    callback(null, items().reduce(function (accumulator, item) {

                        var entries = [];

                        entries.push({
                            caption: item.name + ".value",
                            value: item.name + ".value",
                            meta: "Parlay{" + item.type + "} value"
                        });

                        if (item.type == "datastream") {
                            entries.push({
                                caption: item.name + ".listen()",
                                value: item.name + ".listen()",
                                meta: "Parlay{" + item.type + "} method"
                            });
                        }
                        else {
                            entries.push({
                                caption: item.name + ".get()",
                                value: item.name + ".get()",
                                meta: "Parlay{" + item.type + "} method"
                            });
                            entries.push({
                                caption: item.name + ".set()",
                                value: item.name + ".set(undefined)",
                                meta: "Parlay{" + item.type + "} method"
                            });
                        }

                        return accumulator.concat(entries);
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

        $scope.$watch("configuration.selectedEvent", function (newValue, oldValue) {

            if (oldValue != newValue) {
                $scope.configuration.handler = new ParlayWidgetEventHandler(newValue);
            }

        });

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