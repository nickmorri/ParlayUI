function ParlayWidgetTransformerFactory($rootScope) {

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

    function ParlayWidgetTransformer(intialFunctionString, items) {
        "use strict";

        // Cache the evaluated value so we aren't creating an Interpreter instance for every access.
        // The cached value will be updated whenever the state of the transformer is altered.
        var cached_value;
        Object.defineProperty(this, "value", {
            get: function () {
                return cached_value;
            }
        });

        this.updateCachedValue = function () {
            cached_value = evaluate(this.functionString, this.items);
        };

        var cached_functionString;
        Object.defineProperty(this, "functionString", {
            get: function () {
                return cached_functionString;
            },
            set: function (value) {
                cached_functionString = value;
                this.updateCachedValue();
            }.bind(this)
        });

        // Holds change listener deregistration functions.
        this.handlers = [];

        this.functionString = intialFunctionString;
        this.items = items;

        this.registerHandlers();
    }

    ParlayWidgetTransformer.prototype.registerHandlers = function () {
        this.handlers = this.items.map(function (item) {

            var ref = function () {
                $rootScope.$apply(this.updateCachedValue.bind(this));
            };

            if (item.type == "input") {

                item.element.addEventListener("change", ref.bind(this));

                return function () {
                    item.element.removeEventListener("change", ref);
                }.bind(this);
            }
            else {
                return item.onChange(ref.bind(this));
            }

        }, this);
    };

    ParlayWidgetTransformer.prototype.cleanHandlers = function () {
        if (!!this.handlers && this.handlers.length > 0) {
            while (this.handlers.length > 0) {
                this.handlers.shift().call();
            }
        }
    };

    return ParlayWidgetTransformer;
}

angular.module("parlay.widget.transformer", [])
    .factory("ParlayWidgetTransformer", ["$rootScope", ParlayWidgetTransformerFactory]);