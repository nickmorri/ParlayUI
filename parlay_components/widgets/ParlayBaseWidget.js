function constructInterpreter(functionString, items) {
    "use strict";
    return new Interpreter(functionString, function(interpreter, scope) {
        if (!!items && items.length > 0) {
            items.forEach(function (item) {

                var primitive;

                if (item.type == "input") {
                    primitive = interpreter.createPrimitive(item.element.type == "number" ? parseInt(item.element.value, 10) : item.element.value);
                }
                else {
                    primitive = interpreter.createPrimitive(item.value);
                }

                interpreter.setProperty(scope, item.name + "_value", primitive);
            });
        }
    });
}

function evaluateInterpreter(interpreter) {
    "use strict";
    interpreter.run();
    return interpreter.value.data;
}

function interpret(functionString, items) {
    "use strict";
    if (!!items && !!items && items.length > 0) {
        try {
            return evaluateInterpreter(constructInterpreter(functionString, items));
        }
        catch (e) {
            return e.toString();
        }
    }
}

function buildTemplate(items) {
    "use strict";

    function buildActuals(items) {

        var item_actuals = !!items && items.length > 0 ? items.map(function (current) {
            return current.name + "_value";
        }) : [];

        return "(" + item_actuals.join(", ") + ")";
    }

    function buildParameters(items) {
        var parameters = [];

        for (var i = 0; i < (!!items ? items.length : 0); i++) {
            parameters.push("var" + i);
        }

        return "(" + parameters.join(", ") + ")";
    }

    return "(function " + buildParameters(items) + "{ return undefined; }" + buildActuals(items) + ")";
}

function ParlayWidgetInputManagerFactory() {

    function ParlayWidgetInputManager() {
        "use strict";
        this.widgets = {};
    }

    ParlayWidgetInputManager.prototype.registerInputs = function (element, scope) {
        "use strict";
        var tag_name = element[0].tagName.toLowerCase().split("-").join("_");

        if (!this.widgets[tag_name + "_" + scope.$index]) {
            this.widgets[tag_name + "_" + scope.$index] = [];
        }

        Array.prototype.slice.call(element.find("input")).forEach(function (input) {
            this.widgets[tag_name + "_" + scope.$index].push(input);
        }, this);

        scope.$on("$destroy", function () {
            delete this.widgets[tag_name + "_" + scope.$index];
        }.bind(this));

    };

    ParlayWidgetInputManager.prototype.getInputs = function () {
        return Object.keys(this.widgets).reduce(function (previous, current) {
            return previous.concat(this.widgets[current].map(function (input) {
                return {
                    name: current + "_" + input.id,
                    type: "input",
                    element: input
                };
            }));
        }.bind(this), []);
    };

    return new ParlayWidgetInputManager();
}

function ParlayBaseWidget($mdDialog, $compile) {
    return {
        scope: true,
        restrict: "E",
        link: function (scope, element, attributes, controller) {

            scope.initialized = false;

            // Holds change listener deregistration functions.
            var handlers = [];

            function updateTransformedValue() {
                scope.transformedValue = interpret(scope.transform, scope.selectedItems);
            }

            // Establish a watcher that will manage onChange handlers for the selected values.
            scope.$watchCollection("selectedItems", function (selectedItems) {
                if (!!handlers && handlers.length > 0) {
                    handlers.forEach(function (handler) { handler(); });
                }
                if (!!selectedItems && selectedItems.length > 0) {
                    handlers = selectedItems.map(function (item) {
                        if (item.type == "input") {

                            var callbackRef = function () {
                                scope.$apply(updateTransformedValue);
                            };

                            item.element.addEventListener("change", callbackRef);

                            return function () {
                                item.element.removeEventListener("change", callbackRef);
                            };
                        }
                        else {
                            return item.onChange(function () {
                                scope.$apply(updateTransformedValue);
                            });
                        }

                    });
                }
            });

            // When the scope is destroyed we want to ensure we remove all listeners to prevent memory leaks.
            scope.$on("$destroy", function () { handlers.forEach(function (handler) { handler(); }); });

            scope.edit = function (initialize) {
                $mdDialog.show({
                    templateUrl: "../parlay_components/widgets/directives/parlay-base-widget-configuration-dialog.html",
                    clickOutsideToClose: false,
                    controller: "ParlayBaseWidgetConfigurationDialogController",
                    controllerAs: "dialogCtrl",
                    locals: {
                        selectedItems: !!scope.selectedItems && scope.selectedItems.length >= 0 ? scope.selectedItems : [],
                        transform: scope.transform
                    }
                }).then(function (result) {
                    scope.selectedItems = result.selectedItems;
                    scope.transform = result.transform;

                    if (scope.template != result.template) {

                        while (scope.initialized && element[0].firstChild) {
                            element[0].removeChild(element[0].firstChild);
                        }

                        element[0].appendChild($compile(result.template)(scope)[0]);
                    }
                    scope.template = result.template;

                    updateTransformedValue();
                    scope.initialized = true;
                }).catch(function () {
                    if (initialize) {
                        scope.widgetsCtrl.remove(scope.$index);
                    }
                });
            };

            scope.edit(true);

        },
        controller: "ParlayBaseWidgetController",
        controllerAs: "baseWidgetCtrl"
    };
}

function ParlayBaseWidgetController() {}

function ParlayBaseWidgetConfigurationDialogController($scope, $mdDialog, ParlayWidgetInputManager, ParlayWidgetsCollection, selectedItems, transform) {

    $scope.selectedItems = selectedItems;
    $scope.template = ParlayWidgetsCollection.getAvailableWidgets()[0];
    $scope.transform = transform;

    $scope.$watchCollection("selectedItems", function (newValue, oldValue) {
        if ($scope.transform === undefined || newValue.length !== oldValue.length) {
            $scope.transform = buildTemplate(newValue);
        }
    });

    this.cancel = function () {
        $mdDialog.cancel();
    };

    this.hide = function () {
        $mdDialog.hide({transform: $scope.transform, selectedItems: $scope.selectedItems, template: $scope.template});
    };

    this.interpret = function() {
        $scope.transformedValue = interpret($scope.transform, $scope.selectedItems, ParlayWidgetInputManager.getInputs());
    };

    this.getTemplates = function () {
        return ParlayWidgetsCollection.getAvailableWidgets();
    };

}

function ParlayBaseWidgetConfigurationSourceController($scope, ParlayData, ParlayWidgetInputManager) {

    function inputs() {
        return ParlayWidgetInputManager.getInputs();
    }

    function items() {
        var iterator = ParlayData.values();
        var values = [];
        for (var current = iterator.next(); !current.done; current = iterator.next()) {
            values.push(current.value);
        }
        return values;
    }
    
    this.querySearch = function (query) {

        var filtered_items = items().filter(function (item) {
            return item.name.indexOf(query) > -1 && $scope.selectedItems.indexOf(item) === -1;
        });

        var filter_inputs = inputs().filter(function (input) {
            return input.name.indexOf(query) > -1 && $scope.selectedItems.indexOf(input) === -1;
        });

        return filtered_items.concat(filter_inputs);

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

angular.module("parlay.widgets.base", ["ngMaterial", "ui.ace", "parlay.widgets.collection", "parlay.data"])
    .factory("ParlayWidgetInputManager", [ParlayWidgetInputManagerFactory])
    .controller("ParlayBaseWidgetController", [ParlayBaseWidgetController])
    .controller("ParlayBaseWidgetConfigurationDialogController", ["$scope", "$mdDialog", "ParlayWidgetInputManager", "ParlayWidgetsCollection", "selectedItems", "transform", ParlayBaseWidgetConfigurationDialogController])
    .controller("ParlayBaseWidgetConfigurationSourceController", ["$scope", "ParlayData", "ParlayWidgetInputManager", ParlayBaseWidgetConfigurationSourceController])
    .directive("parlayBaseWidget", ["$mdDialog", "$compile", ParlayBaseWidget]);