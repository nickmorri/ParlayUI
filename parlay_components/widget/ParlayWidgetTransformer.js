(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.interpreter"];

    angular
        .module("parlay.widget.transformer", module_dependencies)
        .factory("ParlayWidgetTransformer", ParlayWidgetTransformerFactory);

    ParlayWidgetTransformerFactory.$inject = ["ParlayInterpreter"];
    function ParlayWidgetTransformerFactory (ParlayInterpreter) {

        /**
         * @service
         * @name ParlayWidgetTransformer
         *
         * @description
         * ParlayWidgetTransformer factory for transforming PromenadeStandardProperty, PromenadeStandardDatastream and
         * HTML <input> values with arbitrary code in a sandboxed JavaScript interpreter.
         *
         * Uses JS-Interpreter internally for code execution.
         * https://github.com/NeilFraser/JS-Interpreter/
         *
         * @attribute {String} functionString - JavaScript code that should be executed on this.run()
         * @attribute {JS-Interpreter} interpreter - JS-Interpreter instance.
         * @attribute {String} constructionError - Initially undefined, if a construction error occurs it will be set
         * error.toString() representation.
         * @attribute {Number|String|Object} value - Result of interpretation of functionString and the state of the
         * interpreter scope.
         * @attribute {Array} items - Contains the items that have been added to the transformer instance.
         * @attribute {Array} handlers - Contains the handlers for the items that have been added to the transformer
         * instance.
         *
         * @param {Array} initialItems - Array of items to add immediately on creation.
         *
         */

        function ParlayWidgetTransformer(initialItems) {

            // Call our parent constructor first.
            ParlayInterpreter.call(this);

            // Result of interpretation of functionString and the state of the interpreter scope.
            Object.defineProperty(this, "value", {
                get: function () {
                    return this.run();
                }
            });

            // The interpreter should be rebuilt whenever the functionString is changed.
            // This means we will to implement both a custom getter/setter, that requires we store the actual value
            // of the functionString in cached_functionString.
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

            // Contains the items that have been added to the transformer instance.
            this.items = [];

            // Contains the handlers for the items that have been added to the transformer instance.
            this.handlers = [];

            // On creation we should add all initialItems if provided.
            if (!!initialItems) {
                initialItems.forEach(function (item) {
                    this.addItem(item);
                }, this);
            }

        }

        // Prototypically inherit from ParlayInterpreter.
        ParlayWidgetTransformer.prototype = Object.create(ParlayInterpreter.prototype);

        /**
         * Construct the parent ParlayInterpreter with the initFunc to ensure that this.items are attached to the
         * JS-Interpreter scope.
         */
        ParlayWidgetTransformer.prototype.construct = function () {
            ParlayInterpreter.prototype.construct.call(this);
        };

        /**
         * Remove all items and handlers from this ParlayWidgetTransformer instance.
         */
        ParlayWidgetTransformer.prototype.cleanHandlers = function () {
            while (!!this.handlers && this.handlers.length > 0) {
                // Array shift will pop remove and return the first element.
                this.items.shift();
                // We call the return value because it is the handler deregistration Function.
                this.handlers.shift()();
            }
        };

        /**
         * Establish a change event listener that will re-construct this ParlayWidgetTransformer instance.
         * @param {Object} item - Item we want to listen for changes on.
         * @returns {Function} - Handler deregistration Function.
         */
        ParlayWidgetTransformer.prototype.registerHandler = function (item) {
            // HTML <input> element
            if (item.type == "input") {

                // If the item changes we should re-construct this ParlayWidgetTransformer instance.
                item.element.addEventListener("change", this.construct.bind(this));

                return function () {
                    item.element.removeEventListener("change", this.construct);
                }.bind(this);
            }
            else {
                // If the item changes we should re-construct this ParlayWidgetTransformer instance.
                return item.onChange(this.construct.bind(this));
            }
        };

        /**
         * Request that the item retrieves the latest value, add it to this.items and this.handlers, register a change
         * handler and finally reconstruct this ParlayWidgetTransformer instance.
         * @param {Object} item - PromenadeStandardProperty, PromenadeStandardDatastream or HTML <input> instance.
         */
        ParlayWidgetTransformer.prototype.addItem = function (item) {

            // Retrieve the latest value.
            if (item.constructor.name == "PromenadeStandardProperty") {
                item.get();
            }
            else if (item.constructor.name == "PromenadeStandardDatastream") {
                item.listen();
            }

            // Store in this.items and this.handlers.
            this.items.push(item);
            this.handlers.push(this.registerHandler(item));

            // Reconstruct this ParlayWidgetTransformer instance.
            this.construct();
        };

        /**
         * Remove from this.items and this.handlers and reconstruct this ParlayWidgetTransformer instance.
         * @param {Object} item - PromenadeStandardProperty, PromenadeStandardDatastream or HTML <input> instance.
         */
        ParlayWidgetTransformer.prototype.removeItem = function (item) {

            var index = this.items.indexOf(item);

            if (index > -1) {
                this.handlers[index]();
                this.handlers.splice(index, 1);
                this.items.splice(index, 1);
            }

            // Reconstruct this ParlayWidgetTransformer instance.
            this.construct();
        };

        /**
         * Converts ParlayWidgetTransformer instance to Object that can be JSON.strinfified.
         * @returns {Object}
         */
        ParlayWidgetTransformer.prototype.toJSON = function () {
            return angular.merge({}, ParlayInterpreter.prototype.toJSON.call(this));
        };

        return ParlayWidgetTransformer;
    }

}());