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

            function makeFunction(interpreter, funcRef) {
                return interpreter.createNativeFunction(function () {
                    funcRef.apply(null, Array.prototype.slice.call(arguments).map(extract));
                });
            }

            function makeObject(interpreter, objectRef) {
                var obj = interpreter.createObject();

                for (var prop in objectRef) {
                    if (typeof objectRef[prop] == "function") {
                        interpreter.setProperty(obj, objectRef[prop].name, interpreter.createNativeFunction(function () {
                            objectRef[prop].apply(objectRef, Array.prototype.slice.call(arguments).map(extract));
                        }));
                    }
                    else if (["string", "number", "boolean"].indexOf(typeof objectRef[prop]) > -1) {
                        interpreter.setProperty(obj, prop, interpreter.createPrimitive(objectRef[prop]));
                    }
                    else if (objectRef[prop] === null) {
                        interpreter.setProperty(obj, prop, interpreter.createPrimitive(null));
                    }
                }
                return obj;
            }

            function makeEvent(interpreter, eventRef) {
                var evt = makeObject(interpreter, eventRef);

                if (eventRef.type == "change") {
                    var val = interpreter.createPrimitive(eventRef.currentTarget.type == "number" ? parseInt(eventRef.currentTarget.value, 10) : eventRef.currentTarget.value);
                    interpreter.setProperty(evt, "newValue", val);
                }
                else if (eventRef.type == "click") {

                }

                return evt;
            }

            function attach(scope, interpreter, name, ref) {
                interpreter.setProperty(scope, name, ref);
            }

            function attachFunction (scope, interpreter, funcRef, optionalName) {
                var fn = makeFunction(interpreter, funcRef);
                var name = !!optionalName ? optionalName : funcRef.name;
                attach(scope, interpreter, name, fn);
            }

            function attachObject (scope, interpreter, objectRef, optionalName) {
                var obj = makeObject(interpreter, objectRef);
                var name = !!optionalName ? optionalName : objectRef.constructor.name;
                attach(scope, interpreter, name, obj);
            }

            function attachEvent(scope, interpreter, eventRef, optionalName) {
                var evt = makeEvent(interpreter, eventRef);
                var name = !!optionalName ? optionalName : "event";
                attach(scope, interpreter, name, evt);
            }

            var items = getItems();
            var functionString = this.functionString;

            var initFunc = function (interpreter, scope) {

                attachObject(scope, interpreter, ParlaySocket);
                attachFunction(scope, interpreter, alert);
                attachFunction(scope, interpreter, console.log.bind(console), "log");
                attachEvent(scope, interpreter, event);

                items.filter(function (item) {
                    return functionString.indexOf(item.name) !== -1;
                }).forEach(function (item) {
                    attachObject(scope, interpreter, item, item.name);
                });

            };

            var interpreter = new Interpreter(this.functionString, initFunc);
            interpreter.run();
        };

        return ParlayWidgetEventHandler;
    }

}());