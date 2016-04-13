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

    function buildTemplate(items, actuals, parameters, body) {
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

        parameters = !!parameters ? parameters : buildParameters(items);
        body = !!body ? body : "{ return undefined; }";
        actuals = !!actuals ? actuals : buildActuals(items);

        return "(function " + parameters + body + actuals + ")";
    }

    function ParlayWidgetTransformer(initialItems) {
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

        var cached_items = [];
        Object.defineProperty(this, "items", {
            get: function () {
                return cached_items;
            },
            set: function(value) {
                if (value.some(function (item) { return cached_items.indexOf(item) === -1; })) {
                    this.cleanHandlers();
                    cached_items = value;
                    this.registerHandlers();
                    this.functionString = buildTemplate(this.items);
                }
            }.bind(this)
        });

        // Holds change listener deregistration functions.
        this.handlers = [];

        this.items = initialItems;

        this.registerHandlers();
    }

    ParlayWidgetTransformer.prototype.registerHandlers = function () {
        this.handlers = this.items.map(function (item) {

            if (item.type == "input") {

                item.element.addEventListener("change", this.updateCachedValue.bind(this));

                return function () {
                    item.element.removeEventListener("change", this.updateCachedValue);
                }.bind(this);
            }
            else {
                return item.onChange(this.updateCachedValue.bind(this));
            }

        }, this);
    };

    ParlayWidgetTransformer.prototype.cleanHandlers = function () {
        while (!!this.handlers && this.handlers.length > 0) {
            this.handlers.shift().call();
        }
    };

    return ParlayWidgetTransformer;
}

angular.module("parlay.widget.transformer", [])
    .factory("ParlayWidgetTransformer", [ParlayWidgetTransformerFactory]);