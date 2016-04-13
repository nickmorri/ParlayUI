function ParlayBaseWidgetConfigurationDialogController($scope, $mdDialog, ParlayWidgetTransformer, ParlayWidgetEventHandler, configuration, template, widgetCompiler) {

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
    }.bind(this));

}

function ParlayBaseWidgetConfigurationTemplateController($scope, ParlayWidgetsCollection) {

    this.getTemplates = function () {
        return ParlayWidgetsCollection.getAvailableWidgets();
    };

}

function ParlayBaseWidgetConfigurationEventController($scope, ParlayWidgetInputManager) {

    this.getEvents = function () {
        var element = ParlayWidgetInputManager.getElements().find(function (element) {
            return element.name.indexOf($scope.wrapper.template.name) > -1;
        });

        return !!element ? element.events : [];
    };

}

function ParlayBaseWidgetConfigurationHandlerController($scope, ParlayWidgetEventHandler) {

    function generateCompleter() {
        return {
            getCompletions: function (editor, session, pos, prefix, callback) {

                var wordList = ["foo", "bar", "baz"];

                callback(null, wordList.map(function (word) {
                    return {
                        caption: word,
                        value: word,
                        meta: "Parlay"
                    };
                }));
            }
        };
    }

    this.onEditorLoad = function (editor) {
        editor.$blockScrolling = Infinity;
        ace.require("ace/ext/language_tools");
        editor.setOptions({enableBasicAutocompletion: true, enableLiveAutocompletion: true});
        editor.completers.push(generateCompleter());
    };

    $scope.$watch("configuration.selectedEvent", function (newValue, oldValue) {

        if (oldValue != newValue) {
            $scope.configuration.handler = new ParlayWidgetEventHandler(newValue);
        }

    });

}

function ParlayBaseWidgetConfigurationSourceController($scope, ParlayData, ParlayWidgetInputManager) {

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

function ParlayBaseWidgetConfigurationTransformController($scope, ParlayData, ParlayWidgetTransformer) {
    "use strict";

    function generateCompleter() {
        return {
            getCompletions: function (editor, session, pos, prefix, callback) {
                callback(null, $scope.configuration.selectedItems.map(function (item) {
                    return {
                        caption: item.name,
                        value: item.name,
                        meta: "Parlay{" + item.type + "}"
                    };
                }));
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

angular.module("parlay.widgets.base.configuration", ["ui.ace", "parlay.widgets.collection", "parlay.widgets.inputmanager", "parlay.widget.transformer", "parlay.widgets.eventhandler", "parlay.data"])
    .controller("ParlayBaseWidgetConfigurationDialogController", ["$scope", "$mdDialog", "ParlayWidgetTransformer", "ParlayWidgetEventHandler", "configuration", "template", "widgetCompiler", ParlayBaseWidgetConfigurationDialogController])
    .controller("ParlayBaseWidgetConfigurationTemplateController", ["$scope", "ParlayWidgetsCollection", ParlayBaseWidgetConfigurationTemplateController])
    .controller("ParlayBaseWidgetConfigurationEventController", ["$scope", "ParlayWidgetInputManager", ParlayBaseWidgetConfigurationEventController])
    .controller("ParlayBaseWidgetConfigurationHandlerController", ["$scope", "ParlayWidgetEventHandler", ParlayBaseWidgetConfigurationHandlerController])
    .controller("ParlayBaseWidgetConfigurationSourceController", ["$scope", "ParlayData", "ParlayWidgetInputManager", ParlayBaseWidgetConfigurationSourceController])
    .controller("ParlayBaseWidgetConfigurationTransformController", ["$scope", "ParlayData", "ParlayWidgetTransformer", ParlayBaseWidgetConfigurationTransformController]);