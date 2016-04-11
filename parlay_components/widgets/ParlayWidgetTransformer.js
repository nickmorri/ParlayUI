function ParlayWidgetTransformerFactory() {

    function constructInterpreter(functionString, items) {
        "use strict";

        var initFunc = function (interpreter, scope) {
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
        };

        return new Interpreter(functionString, initFunc);
    }

    function runInterpreter(interpreter) {
        interpreter.run();
        return interpreter.value.data;
    }

    function evaluate(functionString, items) {
        "use strict";
        try {
            var interpreter = constructInterpreter(functionString, items);
            return runInterpreter(interpreter);
        }
        catch (error) {
            return error.toString();
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

        var main_function = "(function " + buildParameters(items) + "{ return undefined; }" + buildActuals(items) + ")";

        return main_function;
    }

    function ParlayWidgetTransformer($scope, initialFunctionString) {
        "use strict";

        var functionString = initialFunctionString;
        var cached_value;

        Object.defineProperty(this, "functionString", {
            set: function (value) {
                functionString = value;
                cached_value = evaluate(functionString, $scope.configuration.selectedItems);
            },
            get: function () {
                return functionString;
            }
        });

        Object.defineProperty(this, "value", {
            get: function () {
                return cached_value;
            }
        });

        // Holds change listener deregistration functions.
        var handlers = [];

        function cleanHandlers() {
            if (!!handlers && handlers.length > 0) {
                while (handlers.length > 0) {
                    handlers.shift().call();
                }
            }
        }

        // Establish a watcher that will manage onChange handlers for the selected values.
        $scope.$watchCollection("configuration.selectedItems", function (newValue, oldValue) {

            if (this.functionString === undefined || newValue.length !== oldValue.length) {
                this.functionString = buildTemplate(newValue);
            }

            cleanHandlers();
            cached_value = evaluate(functionString, newValue);

            if (!!newValue && newValue.length > 0) {

                handlers = newValue.map(function (item) {

                    var handler = function() {
                        cached_value = evaluate(functionString, newValue);
                        $scope.$digest();
                    };

                    if (item.type == "input") {

                        item.element.addEventListener("change", handler);

                        return function () {
                            item.element.removeEventListener("change", handler);
                        };
                    }
                    else {
                        return item.onChange(handler);
                    }

                });
            }

        }.bind(this));

        // When the scope is destroyed we want to ensure we remove all listeners to prevent memory leaks.
        $scope.$on("$destroy", cleanHandlers);

    }

    return ParlayWidgetTransformer;
}

angular.module("parlay.widget.transformer", [])
    .factory("ParlayWidgetTransformer", [ParlayWidgetTransformerFactory]);