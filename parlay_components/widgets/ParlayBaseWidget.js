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

    if (!!items && items.length > 0) {

        var declaration = "function doStuff";

        var parameters = items.reduce(function (previous, current, index, arr) {
                return previous + "var" + index + (index < arr.length - 1 ? ", " : "");
            }, "(") + ")";

        var actuals = items.reduce(function (previous, current, index, arr) {
                return previous + current.name + "_value" + (index < arr.length - 1 ? ", " : "");
            }, "(") + ")";

        var body = "{ return undefined; }";

        return "(" + declaration + parameters + body + actuals + ")";
    }
    else {
        return "(function doStuff() {return undefined; }())";
    }
}


function ParlayBaseWidget($mdDialog) {
    return {
        scope: true,
        restrict: "E",
        link: function (scope) {

            // Holds onChange deregistration functions.
            var handlers = [];

            // Define property on the scope object to make value access easier for child elements.
            Object.defineProperty(scope, "transformed_value", {
                get: function () {
                    return interpret(scope.transform, scope.info);
                }
            });

            // Establish a watcher that will manage onChange handlers for the selected values.
            scope.$watchCollection("info", function (newValue) {
                if (!!handlers && handlers.length > 0) {
                    handlers.forEach(function (handler) { handler(); });
                }
                if (!!newValue && newValue.length > 0) {
                    handlers = newValue.map(function (item) { return item.onChange(function () { scope.$digest(); }); });
                }
            });

            function showDialog(configuration) {
                $mdDialog.show({
                    templateUrl: "../parlay_components/widgets/directives/parlay-base-widget-configuration-dialog.html",
                    clickOutsideToClose: false,
                    controller: "ParlayBaseWidgetConfigurationDialogController",
                    controllerAs: "dialogCtrl",
                    locals: { configuration: configuration }
                }).then(function (result) {
                    scope.info = result.selectedItems;
                    scope.transform = result.transform;
                });
            }

            showDialog({
                selectedItems: [],
                transform: undefined
            });

            scope.edit = function () {
                showDialog({
                    selectedItems: scope.info,
                    transform: scope.transform
                });
            };

        }
    };
}

function ParlayDemoWidget() {
    return {
        scope: {
            info: "=",
            transformedValue: "@",
            edit: "&"
        },
        templateUrl: "../parlay_components/widgets/directives/parlay-demo-widget.html"
    };
}

function ParlayBaseWidgetConfigurationDialogController($scope, $mdDialog, configuration) {

    $scope.selectedItems = configuration.selectedItems;
    $scope.transform = configuration.transform;

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

    this.interpret = function(info) {
        return interpret($scope.transform, info);
    };

    if (configuration.selectedItem !== undefined) {
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
    .controller("ParlayBaseWidgetConfigurationSourceController", ["$scope", "ParlayData", ParlayBaseWidgetConfigurationSourceController])
    .controller("ParlayBaseWidgetConfigurationDialogController", ["$scope", "$mdDialog", "configuration", ParlayBaseWidgetConfigurationDialogController])
    .directive("parlayDemoWidget", [ParlayDemoWidget])
    .directive("parlayBaseWidget", ["$mdDialog", ParlayBaseWidget]);