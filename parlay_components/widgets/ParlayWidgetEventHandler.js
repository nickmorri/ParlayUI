function ParlayWidgetEventHandlerFactory() {

    function ParlayWidgetEventHandler(initialEvent, initialFunctionString) {

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

        this.functionString = initialFunctionString;
        this.event = initialEvent;
    }

    ParlayWidgetEventHandler.prototype.detach = function () {
        this.event = undefined;
    };

    ParlayWidgetEventHandler.prototype.evaluate = function () {

        var wrapper = function (text) {
            return interpreter.createPrimitive(alert(text));
        };

        var initFunc = function (interpreter, scope) {
            interpreter.setProperty(scope, 'alert', interpreter.createNativeFunction(function(text) {
                return interpreter.createPrimitive(wrapper(text));
            }));
        };

        var interpreter = new Interpreter(this.functionString, initFunc);
        interpreter.run();

    };

    return ParlayWidgetEventHandler;
}

angular.module("parlay.widgets.eventhandler", [])
    .factory("ParlayWidgetEventHandler", [ParlayWidgetEventHandlerFactory]);