(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.interpreter", "parlay.socket"];

    angular
        .module("parlay.widgets.eventhandler", module_dependencies)
        .factory("ParlayWidgetEventHandler", ParlayWidgetEventHandlerFactory);

    ParlayWidgetEventHandlerFactory.$inject = ["ParlayInterpreter", "ParlaySocket"];
    function ParlayWidgetEventHandlerFactory(ParlayInterpreter, ParlaySocket) {

        function ParlayWidgetEventHandler (initialEvent) {

            ParlayInterpreter.call(this);

            var event;
            Object.defineProperty(this, "event", {
                get: function () {
                    return event;
                },
                set: function (value) {
                    if (!!event) {
                        event.removeListener(this.run);
                        event = undefined;
                    }
                    if (!!value) {
                        event = value;
                        event.addListener(this.run.bind(this));
                    }
                }
            });

            this.event = initialEvent;
        }

        ParlayWidgetEventHandler.prototype = Object.create(ParlayInterpreter.prototype);

        ParlayWidgetEventHandler.prototype.construct = function (domEvent) {
            ParlayInterpreter.prototype.construct.call(this, function initFunc(interpreter, scope) {
                this.attachObject(scope, interpreter, ParlaySocket);
                this.attachFunction(scope, interpreter, alert);
                this.attachFunction(scope, interpreter, console.log.bind(console), "log");
                this.attachEvent(scope, interpreter, domEvent);
                this.attachItems(scope, interpreter, this.getItems());
            });
        };

        ParlayWidgetEventHandler.prototype.run = function (domEvent) {
            try {
                this.construct(domEvent);
                return ParlayInterpreter.prototype.run.call(this);
            }
            catch (error) {
                return error.toString();
            }
        };

        ParlayWidgetEventHandler.prototype.detach = function () {
            this.event = null;
        };

        ParlayWidgetEventHandler.prototype.makeEvent = function (interpreter, eventRef) {
            var evt = this.makeObject(interpreter, eventRef);
            var tag = eventRef.target.tagName.toLowerCase();

            if (tag.includes("input")) {

                var obj = interpreter.createObject();

                var currentTarget = event.target;
                var val = currentTarget.type == "number" ? parseInt(currentTarget.value, 10) : currentTarget.value;
                interpreter.setProperty(obj, "name", interpreter.createPrimitive(currentTarget.name));
                interpreter.setProperty(obj, "type", interpreter.createPrimitive(currentTarget.type));
                interpreter.setProperty(obj, "value", interpreter.createPrimitive(val));
                interpreter.setProperty(evt, "element", obj);
            }
            else if (tag.includes("button")) {

            }

            return evt;
        };

        ParlayWidgetEventHandler.prototype.attachEvent = function (scope, interpreter, eventRef, optionalName) {
            var name = !!optionalName ? optionalName : "event";

            if (this.functionString.includes(name)) {
                interpreter.setProperty(scope, name, this.makeEvent(interpreter, eventRef));
            }
        };

        return ParlayWidgetEventHandler;
    }

}());