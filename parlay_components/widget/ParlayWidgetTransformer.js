(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.interpreter.py"];

    angular
        .module("parlay.widget.transformer", module_dependencies)
        .factory("ParlayWidgetTransformer", ParlayWidgetTransformerFactory);

    ParlayWidgetTransformerFactory.$inject = ["ParlayPyInterpreter"];
    function ParlayWidgetTransformerFactory (ParlayPyInterpreter) {

        /**
         * ParlayWidgetTransformer factory for transforming PromenadeStandardProperty, PromenadeStandardDatastream and
         * HTML <input> values with arbitrary code in a sandboxed JavaScript interpreter.
         * Uses JS-Interpreter internally for code execution.
         * https://github.com/NeilFraser/JS-Interpreter/
         *
         * @constructor module:ParlayWidget.ParlayWidgetTransformer
         * @param {Array} initialItems - Array of items to add immediately on creation.
         *
         * @attribute {String} functionString - JavaScript code that should be executed on this.run()
         * @attribute {JS-Interpreter} interpreter - JS-Interpreter instance.
         * @attribute {String} constructionError - Initially undefined, if a construction error occurs it will be set
         * error.toString() representation.
         * @attribute {(Number|String|Object)} value - Result of interpretation of functionString and the state of the
         * interpreter scope.
         * @attribute {Array} items - Contains the items that have been added to the transformer instance.
         * @attribute {Array} handlers - Contains the handlers for the items that have been added to the transformer
         * instance.
         */
        function ParlayWidgetTransformer(initialItems) {
            // Call our parent constructor first.
            ParlayPyInterpreter.call(this);

            /**
             * Result of interpretation of functionString and the state of the interpreter scope.
             * @member module:ParlayWidget.ParlayWidgetTransformer#value
             * @public
             * @type {*}
             */
            Object.defineProperty(this, "value", {
                get: function () {
                    return this.run();
                }
            });


            /**
             * Contains the items that have been added to the transformer instance.
             * @member module:ParlayWidget.ParlayWidgetTransformer#items
             * @public
             * @type {Array}
             */
            this.items = [];

            /**
             * Contains the handlers for the items that have been added to the transformer instance.
             * @member module:ParlayWidget.ParlayWidgetTransformer#handlers
             * @public
             * @type {Array}
             */
            this.handlers = [];



        }

        // Prototypically inherit from ParlayPyInterpreter.
        ParlayWidgetTransformer.prototype = Object.create(ParlayPyInterpreter.prototype);

        /**
         * Construct the parent ParlayPyInterpreter with the initFunc to ensure that this.items are attached to the
         * JS-Interpreter scope.
         * @member module:ParlayWidget.ParlayWidgetTransformer#construct
         * @public
         */
        ParlayWidgetTransformer.prototype.construct = function () {
            ParlayPyInterpreter.prototype.construct.call(this);
        };

        /**
         * Remove all items and handlers from this ParlayWidgetTransformer instance.
         * @member module:ParlayWidget.ParlayWidgetTransformer#cleanHandlers
         * @public
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
         * @member module:ParlayWidget.ParlayWidgetTransformer#registerHandler
         * @public
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
         * Converts ParlayWidgetTransformer instance to Object that can be JSON.stringified.
         * @member module:ParlayWidget.ParlayWidgetTransformer#toJSON
         * @public
         * @returns {Object}
         */
        ParlayWidgetTransformer.prototype.toJSON = function () {
            return angular.merge({}, ParlayPyInterpreter.prototype.toJSON.call(this));
        };

        return ParlayWidgetTransformer;
    }

}());