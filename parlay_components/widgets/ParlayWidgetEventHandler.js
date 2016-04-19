(function () {
    "use strict";

    var module_dependencies = ["parlay.data", "parlay.socket"];

    angular
        .module("parlay.widgets.eventhandler", module_dependencies)
        .factory("ParlayWidgetEventHandler", ParlayWidgetEventHandlerFactory);

    ParlayWidgetEventHandlerFactory.$inject = ["ParlayData", "ParlaySocket"];
    function ParlayWidgetEventHandlerFactory(ParlayData, ParlaySocket) {

        function ParlayWidgetEventHandler (initialEvent) {

            var event;
            Object.defineProperty(this, "event", {
                get: function () {
                    return event;
                },
                set: function (value) {
                    if (!!event) {
                        event.removeListener(this.evaluate);
                        event = undefined;
                    }
                    if (!!value) {
                        event = value;
                        event.addListener(this.evaluate.bind(this));
                    }
                }
            });

            this.event = initialEvent;
        }

        ParlayWidgetEventHandler.prototype.detach = function () {
            this.event = undefined;
        };

        ParlayWidgetEventHandler.prototype.evaluate = function (event) {

            var functionString = this.functionString;

            function getItems() {
                var iterator = ParlayData.values();
                var values = [];
                for (var current = iterator.next(); !current.done; current = iterator.next()) {
                    values.push(current.value);
                }
                return values;
            }

            function extract(item) {
                return item.isPrimitive ? item.data : Object.keys(item.properties).reduce(function (accumulator, key) {
                    accumulator[key] = extract(item.properties[key]);
                    return accumulator;
                }, {});
            }

            function makeFunction(interpreter, funcRef, funcThis) {
                return interpreter.createNativeFunction(function () {
                    funcRef.apply(!!funcThis ? funcThis : null, Array.prototype.slice.call(arguments).map(extract));
                });
            }

            function makeObject(interpreter, objectRef) {
                var obj = interpreter.createObject();

                var prop, prop_val;
                for (prop in objectRef) {
                    if (functionString.indexOf(prop) > -1) {
                        prop_val = objectRef[prop];
                        if (typeof prop_val == "function") {
                            interpreter.setProperty(obj, prop_val.name, makeFunction(interpreter, prop_val, objectRef));
                        }
                        else if (["string", "number", "boolean"].indexOf(typeof prop_val) > -1) {
                            interpreter.setProperty(obj, prop, interpreter.createPrimitive(prop_val));
                        }
                        else if (prop_val === null) {
                            interpreter.setProperty(obj, prop, interpreter.createPrimitive(null));
                        }
                    }
                }

                return obj;
            }

            function makeEvent(interpreter, eventRef) {
                var evt = makeObject(interpreter, eventRef);

                if (eventRef.type == "change") {
                    var currentTarget = event.currentTarget;
                    var val = currentTarget.type == "number" ? parseInt(currentTarget.value, 10) : currentTarget.value;
                    interpreter.setProperty(evt, "newValue", interpreter.createPrimitive(val));
                }
                else if (eventRef.type == "click") {

                }

                return evt;
            }

            function attachFunction (scope, interpreter, funcRef, optionalName) {
                var fn = makeFunction(interpreter, funcRef);
                var name = !!optionalName ? optionalName : funcRef.name;
                interpreter.setProperty(scope, name, fn);
            }

            function attachObject (scope, interpreter, objectRef, optionalName) {
                var obj = makeObject(interpreter, objectRef);
                var name = !!optionalName ? optionalName : objectRef.constructor.name;
                interpreter.setProperty(scope, name, obj);
            }

            function attachEvent(scope, interpreter, eventRef, optionalName) {
                var evt = makeEvent(interpreter, eventRef);
                var name = !!optionalName ? optionalName : "event";
                interpreter.setProperty(scope, name, evt);
            }

            function attachItems(scope, interpreter, items, functionString) {
                items.filter(function (item) {
                    return functionString.indexOf(item.name) !== -1;
                }).forEach(function (item) {
                    attachObject(scope, interpreter, item, item.name);
                });
            }

            function initFunc(interpreter, scope) {
                attachObject(scope, interpreter, ParlaySocket);
                attachFunction(scope, interpreter, alert);
                attachFunction(scope, interpreter, console.log.bind(console), "log");
                attachEvent(scope, interpreter, event);
                attachItems(scope, interpreter, getItems(), functionString);
            }

            var interpreter = new Interpreter(this.functionString, initFunc);
            interpreter.run();
        };

        return ParlayWidgetEventHandler;
    }

}());