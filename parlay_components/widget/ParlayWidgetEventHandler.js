(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.interpreter"];

    angular
        .module("parlay.widget.eventhandler", module_dependencies)
        .factory("ParlayWidgetEventHandler", ParlayWidgetEventHandlerFactory);

    ParlayWidgetEventHandlerFactory.$inject = ["ParlayInterpreter"];
    function ParlayWidgetEventHandlerFactory(ParlayInterpreter) {

        function ParlayWidgetEventHandler () {
            ParlayInterpreter.call(this);
            
            var eventRef, handlerRef;

            handlerRef = this;

            function listenerCallback(domEvent) {
                handlerRef.construct(domEvent);
                handlerRef.run();
            }
            
            this.attach = function (event) {
                eventRef = event;
                eventRef.addListener(listenerCallback);
                eventRef.handler = this;
            };
            
            this.detach = function () {
                eventRef.removeListener(listenerCallback);
                eventRef.handler = null;
            };
            
        }

        ParlayWidgetEventHandler.prototype = Object.create(ParlayInterpreter.prototype);

        ParlayWidgetEventHandler.prototype.construct = function (domEvent) {
            ParlayInterpreter.prototype.construct.call(this, function initFunc(interpreter, scope) {
                this.attachEvent(scope, interpreter, domEvent);
            });
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
        
        ParlayWidgetEventHandler.prototype.toJSON = function () {
            return angular.merge({}, ParlayInterpreter.toJSON.call(this));
        };

        return ParlayWidgetEventHandler;
    }

}());