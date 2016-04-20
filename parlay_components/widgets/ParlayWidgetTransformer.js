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

            this.updateValue = function () {
                this.value = this.run();
            };

            var cached_functionString;
            Object.defineProperty(this, "functionString", {
                get: function () {
                    return cached_functionString;
                },
                set: function (value) {
                    cached_functionString = value;
                    this.updateValue();
                }.bind(this)
            });

            this.items = [];

            if (!!initialItems) {
                initialItems.forEach(this.addItem);
            }

            this.updateValue();

        }

        ParlayWidgetTransformer.prototype = Object.create(ParlayInterpreter.prototype);

        ParlayWidgetTransformer.prototype.run = function () {
            try {
                var items = this.items.map(function (container) { return container.item; });

                var result = ParlayInterpreter.prototype.run.call(this, function initFunc(interpreter, scope) {
                    this.attachItems(scope, interpreter, items);
                });

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
            while (!!this.items && this.items.length > 0) {
                this.items.shift().handler();
            }
        };

        ParlayWidgetTransformer.prototype.registerHandler = function (item) {
            if (item.type == "input") {

                item.element.addEventListener("change", this.updateValue.bind(this));

                return function () {
                    item.element.removeEventListener("change", this.updateValue);
                }.bind(this);
            }
            else {
                return item.onChange(this.updateValue.bind(this));
            }
        };

        ParlayWidgetTransformer.prototype.addItem = function (item) {
            this.items.push({
                item: item,
                handler: this.registerHandler(item)
            });
        };

        ParlayWidgetTransformer.prototype.removeItem = function (item) {
            var index = this.items.findIndex(function (candidate) {
                return item == candidate.item;
            });

            if (index >= 0) {
                this.items[index].handler();
                this.items.splice(index, 1);
            }
        };

        return ParlayWidgetTransformer;
    }

}());