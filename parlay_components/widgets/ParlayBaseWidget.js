function constructInterpreter(functionString, items) {
    "use strict";
    if (!!items && !!items && items.length > 0) {
        return new Interpreter(functionString, function(interpreter, scope) {
            items.forEach(function (item) {
                interpreter.setProperty(scope, item.name + "_value", interpreter.createPrimitive(item.value));
            });
        });
    }
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
    var declaration, body, parameters, actuals;

    declaration = "function ";

    if (!!items && items.length > 0) {
        parameters = items.reduce(function (previous, current, index, arr) {
            return previous + "var" + index + (index < arr.length - 1 ? ", " : "");
        }, "(") + ")";
        actuals = items.reduce(function (previous, current, index, arr) {
            return previous + current.name + "_value" + (index < arr.length - 1 ? ", " : "");
        }, "(") + ")";
        body = items.reduce(function (previous, current, index, arr) {
            return previous + "var" + index + (index < arr.length - 1 ? " + " : "");
        }, "{ return ") + "; }";
    }
    else {
        parameters = "() ";
        actuals = "()";
        body = "{ return undefined; }";
    }

    return "(" + declaration + parameters + body + actuals + ")";
}

function ParlayBaseWidget($mdDialog) {
    return {
        scope: true,
        restrict: "E",
        link: function (scope, element, attributes, controller) {

            // Holds onChange deregistration functions.
            var handlers = [];

            function updateTransformedValue() {
                scope.transformedValue = interpret(scope.transform, scope.selectedItems);
            }

            // Establish a watcher that will manage onChange handlers for the selected values.
            scope.$watchCollection("selectedItems", function (newValue) {
                if (!!handlers && handlers.length > 0) {
                    handlers.forEach(function (handler) { handler(); });
                }
                if (!!newValue && newValue.length > 0) {
                    handlers = newValue.map(function (item) {
                        return item.onChange(function () {
                            scope.$apply(updateTransformedValue);
                        });
                    });
                }
            });

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
    var buttons = [];
    var selects = [];

    this.registerInput = function (element) {
        inputs.push(element);
    };

    this.registerButton = function (element) {
        buttons.push(element);
    };

    this.registerSelect = function (element) {
        selects.push(element);
    };

    this.getInputs = function () {
        return inputs;
    };

    this.getButtons = function () {
        return buttons;
    };

    this.getSelects = function () {
        return selects;
    };

}

function ParlayDemoWidget() {
    return {
        templateUrl: "../parlay_components/widgets/directives/parlay-demo-widget.html",
        require: "^parlayBaseWidget",
        link: function (scope, element, attributes, controller) {
            Array.prototype.slice.call(element.find("input")).forEach(controller.registerInput);
            Array.prototype.slice.call(element.find("button")).forEach(controller.registerButton);
            Array.prototype.slice.call(element.find("select")).forEach(controller.registerSelect);
        }
    };
}

function ParlayBaseWidgetConfigurationDialogController($scope, $mdDialog, selectedItems, transform, baseWidgetCtrl) {

    $scope.selectedItems = selectedItems;
    $scope.transform = transform;
    $scope.baseWidgetCtrl = baseWidgetCtrl;

    $scope.$watchCollection("selectedItems", function (newValue, oldValue) {
        if ($scope.transform === undefined || newValue.length !== oldValue.length) {
            $scope.transform = buildTemplate(newValue);
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

    this.currentStage = "source";

    this.stageComplete= {
        source: false,
        transform: false
    };

    this.interpret = function() {
        $scope.transformedValue = interpret($scope.transform, $scope.selectedItems); 
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
    
}

angular.module("parlay.widgets.base", ["parlay.data", "ngMaterial", "ui.ace"])
    .controller("ParlayBaseWidgetController", [ParlayBaseWidgetController])
    .controller("ParlayBaseWidgetConfigurationSourceController", ["$scope", "ParlayData", ParlayBaseWidgetConfigurationSourceController])
    .controller("ParlayBaseWidgetConfigurationDialogController", ["$scope", "$mdDialog", "selectedItems", "transform", "baseWidgetCtrl", ParlayBaseWidgetConfigurationDialogController])
    .directive("parlayDemoWidget", [ParlayDemoWidget])
    .directive("parlayBaseWidget", ["$mdDialog", ParlayBaseWidget]);