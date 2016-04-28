(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.interpreter"];

    angular
        .module("parlay.widget.transformer", module_dependencies)
        .factory("ParlayWidgetTransformer", ParlayWidgetTransformerFactory);

    ParlayWidgetTransformerFactory.$inject = ["ParlayInterpreter"];
    function ParlayWidgetTransformerFactory (ParlayInterpreter) {

        function ParlayWidgetTransformer(initialItems) {

            ParlayInterpreter.call(this);

            Object.defineProperty(this, "value", {
                get: function () {
                    return this.run();
                }
            });

            var cached_functionString;
            Object.defineProperty(this, "functionString", {
                get: function () {
                    return cached_functionString;
                },
                set: function (value) {
                    cached_functionString = value;
                    this.construct();
                }.bind(this)
            });

            this.items = [];
            this.handlers = [];

            if (!!initialItems) {
                initialItems.forEach(function (item) {
                    this.addItem(item);
                }, this);
            }

            this.construct();

        }

        ParlayWidgetTransformer.prototype = Object.create(ParlayInterpreter.prototype);

        ParlayWidgetTransformer.prototype.construct = function () {

            if (!this.functionString) {
                return;
            }

            ParlayInterpreter.prototype.construct.call(this, function initFunc(interpreter, scope) {
                this.attachItems(scope, interpreter, this.items);
            });
        };

        ParlayWidgetTransformer.prototype.run = function () {
            try {
                var result = ParlayInterpreter.prototype.run.call(this);

                return !!result ? result : "Editor is empty. Please enter a valid statement.";
            }
            catch (error) {

                if (!this.functionString) {
                    return "Editor is empty. Please enter a valid statement.";
                }

                return error.toString();
            }
        };

        ParlayWidgetTransformer.prototype.cleanHandlers = function () {
            while (!!this.handlers && this.handlers.length > 0) {
                this.items.shift();
                this.handlers.shift()();
            }
        };

        ParlayWidgetTransformer.prototype.registerHandler = function (item) {
            if (item.type == "input") {

                item.element.addEventListener("change", this.construct.bind(this));

                return function () {
                    item.element.removeEventListener("change", this.construct);
                }.bind(this);
            }
            else {
                return item.onChange(this.construct.bind(this));
            }
        };

        ParlayWidgetTransformer.prototype.addItem = function (item) {

            if (item.constructor.name == "PromenadeStandardProperty") {
                item.get();
            }
            else if (item.constructor.name == "PromenadeStandardDatastream") {
                item.listen();
            }

            this.items.push(item);
            this.handlers.push(this.registerHandler(item));

            this.construct();
        };

        ParlayWidgetTransformer.prototype.removeItem = function (item) {

            var index = this.items.indexOf(item);

            if (index > -1) {
                this.handlers[index]();
                this.handlers.splice(index, 1);
            }
            this.construct();
        };

        ParlayWidgetTransformer.prototype.toJSON = function () {
            return angular.merge({}, ParlayInterpreter.toJSON.call(this));
        };

        return ParlayWidgetTransformer;
    }

}());