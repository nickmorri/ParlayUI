function ParlayWidgetTransformerFactory() {

    function constructInterpreter(functionString, items) {
        "use strict";
        return new Interpreter(functionString, function(interpreter, scope) {
            if (!!items && items.length > 0) {
                items.forEach(function (item) {

                    var property_value;

                    if (item.type == "input") {
                        property_value = interpreter.createPrimitive(item.element.type == "number" ? parseInt(item.element.value, 10) : item.element.value);
                    }
                    else if (item.type == "button") {
                        // Do something?
                    }
                    else {
                        property_value = interpreter.createPrimitive(item.value);
                    }

                    interpreter.setProperty(scope, item.name + "_value", property_value);
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

    function ParlayWidgetTransformer($scope, initialFunctionString) {
        "use strict";

        var functionString = initialFunctionString;

        Object.defineProperty(this, "functionString", {
            set: function (value) {
                functionString = value;
            },
            get: function () {
                return functionString;
            }
        });

        Object.defineProperty(this, "value", {
            get: function () {
                return interpret(this.functionString, $scope.selectedItems);
            }
        });

        $scope.$watchCollection("selectedItems", function (newValue, oldValue) {
            if (this.functionString === undefined || newValue.length !== oldValue.length) {
                this.functionString = buildTemplate(newValue);
            }
        }.bind(this));

        // Holds change listener deregistration functions.
        var handlers = [];

        // Establish a watcher that will manage onChange handlers for the selected values.
        $scope.$watchCollection("selectedItems", function (selectedItems) {
            if (!!handlers && handlers.length > 0) {
                handlers.forEach(function (handler) { handler(); });
            }
            if (!!selectedItems && selectedItems.length > 0) {
                handlers = selectedItems.map(function (item) {
                    if (item.type == "input") {

                        var ref = function() {
                            $scope.$digest();
                        };

                        item.element.addEventListener("change", ref);

                        return function () {
                            item.element.removeEventListener("change", ref);
                        }.bind(this);
                    }
                    else {
                        return item.onChange(function() {
                            $scope.$digest();
                        });
                    }

                }, this);
            }
        }.bind(this));

        // When the scope is destroyed we want to ensure we remove all listeners to prevent memory leaks.
        $scope.$on("$destroy", function () { handlers.forEach(function (handler) { handler(); }); });

    }

    return ParlayWidgetTransformer;
}

angular.module("parlay.widget.transformer", [])
    .factory("ParlayWidgetTransformer", [ParlayWidgetTransformerFactory]);