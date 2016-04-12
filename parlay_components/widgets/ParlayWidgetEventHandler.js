function ParlayWidgetEventHandlerFactory() {

    function ParlayWidgetEventHandler(event, initialFunctionString) {
        this.event = event;
        this.functionString = initialFunctionString;
        this.callback = undefined;

        this.attach();
    }

    ParlayWidgetEventHandler.prototype.attach = function () {
        this.event.addListener(this.evaluate.bind(this));
    };

    ParlayWidgetEventHandler.prototype.deattach = function () {
        this.event.removeListener(this.evaluate);
    };

    ParlayWidgetEventHandler.prototype.evaluate = function () {

        var wrapper = function (text) {
            return interpreter.createPrimitive(alert(text));
        };

        var initFunc = function (interpreter, scope) {
            interpreter.setProperty(scope, "x", interpreter.createPrimitive(10));
            interpreter.setProperty(scope, "y", interpreter.createPrimitive(20));

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