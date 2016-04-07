function constructInterpreter(functionString, items, elements) {
    "use strict";
    return new Interpreter(functionString, function(interpreter, scope) {
        if (!!items && items.length > 0) {
            items.forEach(function (item) {
                interpreter.setProperty(scope, item.name + "_value", interpreter.createPrimitive(item.value));
            });
        }
        if (!!elements && elements.length > 0) {
            elements.forEach(function (element) {
                var primitive = interpreter.createPrimitive(element.type == "number" ? parseInt(element.value, 10) : element.value);
                interpreter.setProperty(scope, element.id + "_" + element.tagName.toLowerCase() + "_" + element.type, primitive);
            });
        }
    });
}

function evaluateInterpreter(interpreter) {
    "use strict";
    interpreter.run();
    return interpreter.value.data;
}

function interpret(functionString, items, elements) {
    "use strict";
    if (!!items && !!items && items.length > 0) {
        try {
            return evaluateInterpreter(constructInterpreter(functionString, items, elements));
        }
        catch (e) {
            return e.toString();
        }
    }
}

function buildTemplate(items, elements) {

    function buildActuals(items, elements) {

        var item_actuals = !!items && items.length > 0 ? items.map(function (current) {
            return current.name + "_value";
        }) : [];

        var element_actuals = !!elements && elements.length > 0 ? elements.map(function (current) {
            return current.id + "_" + current.tagName.toLowerCase() + "_" + current.type;
        }) : [];

        return "(" + [].concat(item_actuals).concat(element_actuals).join(", ") + ")";
    }

    function buildParameters(items, elements) {
        var variable_count = (!!items ? items.length : 0) + (!!elements ? elements.length : 0);

        var parameters = [];

        for (var i = 0; i < variable_count; i++) {
            parameters.push("var" + i);
        }

        return "(" + parameters.join(", ") + ")";
    }

    return "(function " + buildParameters(items, elements) + "{ return undefined; }" + buildActuals(items, elements) + ")";
}

function ParlayBaseWidget($mdDialog) {
    return {
        scope: true,
        restrict: "E",
        link: function (scope, element, attributes, controller) {

            scope.item.controller = controller;

            // Holds onChange deregistration functions.
            var handlers = [];

            function updateTransformedValue() {
                scope.transformedValue = interpret(scope.transform, scope.selectedItems, controller.getInputs());
            }

            // Establish a watcher that will manage onChange handlers for the selected values.
            scope.$watchCollection("selectedItems", function (selectedItems) {
                if (!!handlers && handlers.length > 0) {
                    handlers.forEach(function (handler) { handler(); });
                }
                if (!!selectedItems && selectedItems.length > 0) {
                    handlers = selectedItems.map(function (item) {
                        return item.onChange(function () {
                            scope.$apply(updateTransformedValue);
                        });
                    });
                }
            });

            scope.$watchCollection("inputs", updateTransformedValue);

            scope.edit = function () {
                $mdDialog.show({
                    templateUrl: "../parlay_components/widgets/directives/parlay-base-widget-configuration-dialog.html",
                    clickOutsideToClose: false,
                    controller: "ParlayBaseWidgetConfigurationDialogController",
                    controllerAs: "dialogCtrl",
                    locals: {
                        selectedItems: !!scope.selectedItems && scope.selectedItems.length >= 0 ? scope.selectedItems : [],
                        transform: scope.transform,
                        baseWidgetCtrl: controller
                    }
                }).then(function (result) {
                    scope.selectedItems = result.selectedItems;
                    scope.transform = result.transform;
                    updateTransformedValue();
                });
            };

            scope.edit();

        },
        controller: "ParlayBaseWidgetController",
        controllerAs: "baseWidgetCtrl"
    };
}

function ParlayBaseWidgetController() {

    var inputs = [];

    this.registerInput = function (element) {
        inputs.push(element);
    };

    this.getInputs = function () {
        return inputs;
    };

}

function ParlayBaseWidgetConfigurationDialogController($scope, $mdDialog, selectedItems, transform, baseWidgetCtrl) {

    $scope.selectedItems = selectedItems;
    $scope.transform = transform;
    $scope.baseWidgetCtrl = baseWidgetCtrl;

    $scope.$watchCollection("selectedItems", function (newValue, oldValue) {
        if ($scope.transform === undefined || newValue.length !== oldValue.length) {
            $scope.transform = buildTemplate(newValue, $scope.baseWidgetCtrl.getInputs());
        }
    });
    
    this.markStage = function (stage, state) {
        this.stageComplete[stage] = state;
    }.bind(this);
    
    this.stageAccessible = function (stage) {
        return stage == "source" || this.stageComplete[stage];
    };
    
    this.isConfigurationComplete = function () {
        return Object.keys(this.stageComplete).every(function (key) {
            return this.stageComplete[key];
        }, this);
    };

    this.cancel = function () {
        $mdDialog.cancel();
    };

    this.hide = function () {
        $mdDialog.hide({transform: $scope.transform, selectedItems: $scope.selectedItems});
    };

    $scope.$watchCollection("selectedItems", function (newValue) {
        this.markStage("transform", newValue.length > 0);
    }.bind(this));

    this.stageComplete= {
        source: false,
        transform: false
    };

    this.interpret = function() {
        $scope.transformedValue = interpret($scope.transform, $scope.selectedItems, $scope.baseWidgetCtrl.getInputs());
    };

    if ($scope.selectedItems !== undefined) {
        this.markStage("source", true);
    }

}

function ParlayBaseWidgetConfigurationSourceController($scope, ParlayData) {

    this.items = function () {
        var iterator = ParlayData.values();
        var values = [];
        for (var current = iterator.next(); !current.done; current = iterator.next()) {
            values.push(current.value);
        }
        return values;
    };
    
    this.querySearch = function (query) {
        return this.items().filter(function (item) {
            return item.name.indexOf(query) > -1 && $scope.selectedItems.indexOf(item) === -1;
        });
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

angular.module("parlay.widgets.base", ["parlay.data", "ngMaterial", "ui.ace"])
    .controller("ParlayBaseWidgetController", [ParlayBaseWidgetController])
    .controller("ParlayBaseWidgetConfigurationSourceController", ["$scope", "ParlayData", ParlayBaseWidgetConfigurationSourceController])
    .controller("ParlayBaseWidgetConfigurationDialogController", ["$scope", "$mdDialog", "selectedItems", "transform", "baseWidgetCtrl", ParlayBaseWidgetConfigurationDialogController])
    .directive("parlayBaseWidget", ["$mdDialog", ParlayBaseWidget]);