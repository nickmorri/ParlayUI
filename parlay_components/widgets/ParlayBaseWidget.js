function ParlayBaseWidget($mdDialog, $compile, ParlayWidgetTransformer) {
    return {
        scope: true,
        restrict: "E",
        link: function (scope, element) {

            scope.initialized = false;

            scope.configuration = {};

            function compileWrapper() {
                var scopeRef = scope;
                var elementRef = element;

                return function (template) {
                    if (scopeRef.template != template.template) {
                        while (elementRef[0].firstChild) {
                            angular.element(elementRef[0].firstChild).scope().$destroy();
                            elementRef[0].removeChild(elementRef[0].firstChild);
                        }

                        elementRef[0].appendChild($compile(template.template)(scopeRef.$new())[0]);
                        scopeRef.template = template;
                    }
                };
            }

            scope.edit = function (initialize) {
                $mdDialog.show({
                    templateUrl: "../parlay_components/widgets/directives/parlay-base-widget-configuration-dialog.html",
                    clickOutsideToClose: false,
                    controller: "ParlayBaseWidgetConfigurationDialogController",
                    controllerAs: "dialogCtrl",
                    locals: {
                        selectedItems: !!scope.selectedItems && scope.selectedItems.length >= 0 ? scope.selectedItems : [],
                        transform: !!scope.transformer ? scope.transformer.functionString : "",
                        template: scope.template,
                        widgetCompiler: compileWrapper()
                    }
                }).then(function (result) {
                    scope.initialized = true;

                    scope.configuration.selectedItems = result.selectedItems;
                    scope.configuration.transformer = new ParlayWidgetTransformer(scope, result.transform);
                }).catch(function () {
                    if (initialize) {
                        scope.widgetsCtrl.remove(scope.$index);
                    }
                });
            };

            scope.edit(true);

        }
    };
}

function ParlayBaseWidgetConfigurationDialogController($scope, $mdDialog, ParlayWidgetsCollection, ParlayWidgetTransformer, selectedItems, transform, template, widgetCompiler) {

    $scope.configuration = {
        selectedItems: selectedItems,
        selectedEvents: [],
        template: template,
        transformer: new ParlayWidgetTransformer($scope, transform)
    };

    this.cancel = function () {
        $mdDialog.cancel();
    };

    this.hide = function () {
        $mdDialog.hide({transform: $scope.configuration.transformer.functionString, selectedItems: $scope.configuration.selectedItems, template: $scope.configuration.template.template});
    };

    this.validTemplate = function () {
        return !!$scope.configuration.template;
    };

    this.validSource = function () {
        return $scope.configuration.template.type == "input" || $scope.configuration.selectedItems.length > 0;
    };

    this.validTransformation = function () {
        return true;
    };

    this.validConfiguration = function () {
        return this.validTemplate() && this.validSource() && this.validTransformation();
    };

    $scope.$watch("configuration.template", function () {
        if (this.validTemplate()) {
            widgetCompiler($scope.configuration.template);

            if ($scope.configuration.template.type == "input") {
                $scope.configuration.selectedItems = [];
            }
            else if ($scope.configuration.template.type == "display") {
                $scope.configuration.selectedEvents = [];
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

    this.querySearch = function (query) {
        var lowercase_query = query.toLowerCase();

        return ParlayWidgetInputManager.getElements().find(function (element) {
            return element.name.indexOf($scope.configuration.template.name) > -1;
        }).events.filter(function (event) {
            return event.indexOf(lowercase_query) > -1 && $scope.configuration.selectedEvents.indexOf(event) === -1;
        });
    };

}

function ParlayBaseWidgetConfigurationHandlerController($scope) {
    
    $scope.$watchCollection("configuration.selectedEvents", function (newValue, oldValue) {

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
    
}

function ParlayBaseWidgetConfigurationTransformController() {

    function generateCompleter() {
        return {
            getCompletions: function (editor, session, pos, prefix, callback) {

                var wordList = $scope.configuration.selectedItems.map(function (item) {
                    return item.name + "_value";
                });

                callback(null, wordList.map(function (word) {
                    return {
                        caption: word,
                        value: word,
                        meta: "static"
                    };
                }));
            }
        };
    }

    this.onEditorLoad = function (editor) {
        editor.$blockScrolling = Infinity;
        ace.require("ace/ext/language_tools");
        editor.setOptions({enableBasicAutocompletion: true, enableLiveAutocompletion: true});
        // editor.completers.push(generateCompleter());
    };
    
}

angular.module("parlay.widgets.base", ["ngMaterial", "ui.ace", "parlay.widgets.collection", "parlay.widgets.inputmanager", "parlay.widget.transformer", "parlay.data"])
    .controller("ParlayBaseWidgetConfigurationDialogController", ["$scope", "$mdDialog", "ParlayWidgetsCollection", "ParlayWidgetTransformer", "selectedItems", "transform", "template", "widgetCompiler", ParlayBaseWidgetConfigurationDialogController])
    .controller("ParlayBaseWidgetConfigurationTemplateController", ["$scope", "ParlayWidgetsCollection", ParlayBaseWidgetConfigurationTemplateController])
    .controller("ParlayBaseWidgetConfigurationEventController", ["$scope", "ParlayWidgetInputManager", ParlayBaseWidgetConfigurationEventController])
    .controller("ParlayBaseWidgetConfigurationHandlerController", ["$scope", ParlayBaseWidgetConfigurationHandlerController])
    .controller("ParlayBaseWidgetConfigurationSourceController", ["$scope", "ParlayData", "ParlayWidgetInputManager", ParlayBaseWidgetConfigurationSourceController])
    .controller("ParlayBaseWidgetConfigurationTransformController", ["$scope", ParlayBaseWidgetConfigurationTransformController])
    .directive("parlayBaseWidget", ["$mdDialog", "$compile", "ParlayWidgetTransformer", ParlayBaseWidget]);