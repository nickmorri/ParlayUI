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

        ParlayWidgetEventHandler.prototype.evaluate = function () {

            function getItems() {
                var iterator = ParlayData.values();
                var values = [];
                for (var current = iterator.next(); !current.done; current = iterator.next()) {
                    values.push(current.value);
                }
                return values;
            }

            function attachFunction (scope, interpreter, funcRef) {
                interpreter.setProperty(scope, funcRef.name, interpreter.createNativeFunction(function () {
                    funcRef.apply(null, Array.prototype.slice.call(arguments).map(extract));
                }));
            }

            function attachObject (scope, interpreter, objectRef, optionalName) {
                var obj = interpreter.createObject();

                Object.getOwnPropertyNames(objectRef).filter(function(prop) {
                    return typeof objectRef[prop] === "function";
                }).map(function (prop) {
                    return objectRef[prop];
                }).forEach(function (method) {
                    interpreter.setProperty(obj, method.name, interpreter.createNativeFunction(function () {
                        method.apply(objectRef, Array.prototype.slice.call(arguments).map(extract));
                    }));
                });

                interpreter.setProperty(scope, optionalName ? optionalName : objectRef.constructor.name, obj);
            }

            function extract(item) {
                return item.isPrimitive ? item.data : Object.keys(item.properties).reduce(function (accumulator, key) {
                    accumulator[key] = extract(item.properties[key]);
                    return accumulator;
                }, {});
            }

            var items = getItems();
            var functionString = this.functionString;

            var initFunc = function (interpreter, scope) {

                attachObject(scope, interpreter, ParlaySocket);
                attachFunction(scope, interpreter, alert);

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