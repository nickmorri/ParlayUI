function ParlayWidgetEventHandlerFactory(ParlayData) {

    function ParlayWidgetEventHandler(initialEvent) {

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

        function makeObject(interpreter, item) {

            var obj = interpreter.createObject();

            if (item.type == "datastream") {
                item.listen();
                interpreter.setProperty(obj, "listen", interpreter.createNativeFunction(function () {
                    item.listen();
                }));
            }
            else {
                item.get();

                interpreter.setProperty(obj, "get", interpreter.createNativeFunction(function () {
                    item.get();
                }));

                interpreter.setProperty(obj, "set", interpreter.createNativeFunction(function (value) {
                    item.value = value.data;
                    item.set();
                }));
            }

            interpreter.setProperty(obj, "value", interpreter.createPrimitive(item.value));

            return obj;
        }

        var items = getItems();
        var functionString = this.functionString;

        var initFunc = function (interpreter, scope) {

            interpreter.setProperty(scope, 'alert', interpreter.createNativeFunction(function(text) {
                return interpreter.createPrimitive(alert(text));
            }));

            items.filter(function (item) {
                return functionString.indexOf(item.name) !== -1;
            }).forEach(function (item) {
                interpreter.setProperty(scope, item.name, makeObject(interpreter, item));
            });

        };

        var interpreter = new Interpreter(this.functionString, initFunc);
        interpreter.run();
    };

    return ParlayWidgetEventHandler;
}

angular.module("parlay.widgets.eventhandler", ["parlay.data"])
    .factory("ParlayWidgetEventHandler", ["ParlayData", ParlayWidgetEventHandlerFactory]);