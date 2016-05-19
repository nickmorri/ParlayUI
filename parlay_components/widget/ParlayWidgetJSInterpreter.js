(function () {
    "use strict";
    
    var module_dependencies = ["parlay.data", "parlay.socket"];
    
    angular
        .module("parlay.widget.interpreter", module_dependencies)
        .factory("ParlayInterpreter", ParlayInterpreterFactory);

    ParlayInterpreterFactory.$inject = ["ParlayData", "ParlaySocket"];
    function ParlayInterpreterFactory (ParlayData, ParlaySocket) {

        /**
         * Extracts interesting values from a JS-Interpreter scope item, all JS-Interpreter metadata will be removed.
         * @param {Object} item - JS-Interpreter scope item.
         * @returns {Object} - Actual data without JS-Interpreter metadata.
         */
        function df_extract (item) {
            return item.isPrimitive ? item.data : Object.keys(item.properties).reduce(function (accumulator, key) {
                accumulator[key] = df_extract(item.properties[key]);
                return accumulator;
            }, {});
        }

        /**
         * @service
         * @name ParlayInterpreter
         *
         * @description
         * ParlayInterpreter factory for running arbitrary code in a sandboxed JavaScript interpreter.
         *
         * Uses JS-Interpreter internally for code execution.
         * https://github.com/NeilFraser/JS-Interpreter/
         *
         * @attribute {String} functionString - JavaScript code that should be executed on this.run()
         * @attribute {JS-Interpreter} interpreter - JS-Interpreter instance.
         * @attribute {String} constructionError - Initially undefined, if a construction error occurs it will be set
         * error.toString() representation.
         *
         */

        function ParlayInterpreter () {
            this.functionString = undefined;
            this.interpreter = undefined;
            this.constructionError = undefined;
        }

        /**
         * Attempts to construct a JS-Interpreter instance using functionString and the given childInitFunc.
         * If construction fails constructionError will be set to the String representation of the caught error.
         * @param {Function} childInitFunc - Initialization function that is given access to the interpreter instance
         * and it's scope.
         *
         * Additionally it attaches a few Objects and functions that may be convenient for the end user.
         */
        ParlayInterpreter.prototype.construct = function (childInitFunc) {

            this.constructionError = undefined;

            if (!this.functionString) {
                this.constructionError = "Editor is empty. Please enter a valid statement.";
            }
            else {
                try {
                    this.interpreter = new Interpreter(this.functionString, function (interpreter, scope) {

                        this.attachObject(scope, interpreter, ParlaySocket);
                        this.attachFunction(scope, interpreter, alert);
                        this.attachFunction(scope, interpreter, console.log.bind(console), "log");

                        var parlay_items = this.getItems().reduce(function (accumulator, current) {

                            if (!accumulator[current.item_name]) {
                                accumulator[current.item_name] = interpreter.createObject();
                            }

                            this.attachObject(accumulator[current.item_name], interpreter, current, current.name);

                            return accumulator;
                        }.bind(this), {});

                        Object.keys(parlay_items).forEach(function (parlay_item_name) {
                            interpreter.setProperty(scope, parlay_item_name, parlay_items[parlay_item_name]);
                        }, this);

                        if (!!childInitFunc) {
                            childInitFunc.call(this, interpreter, scope);
                        }

                    }.bind(this));
                }
                catch (error) {
                    this.constructionError = error.toString();
                }
            }


        };

        /**
         * Attempts to run the constructed interpreter. 
         * @returns {Object} - Result of interpretation of functionString and the state of the interpreter scope.
         */
        ParlayInterpreter.prototype.run = function () {
            if (!!this.constructionError) {
                return this.constructionError;
            }
            else if (!this.interpreter) {
                return "ParlayInterpreter.construct() must be done before ParlayInterpreter.run()";
            }
            else {
                try {
                    this.interpreter.run();
                    return this.interpreter.value.data || "undefined";
                }
                catch (error) {
                    return error.toString();
                }
            }
        };

        /**
         * Helper method which retrieves items from ParlayData.
         * @returns {Array} - Items from ParlayData.
         */
        ParlayInterpreter.prototype.getItems = function () {
            var iterator = ParlayData.values();
            var values = [];
            for (var current = iterator.next(); !current.done; current = iterator.next()) {
                values.push(current.value);
            }
            return values;
        };

        /**
         * Creates and returns a JS-Interpreter native Function that can be attached to a JS-Interpreter scope.
         * @param {JS-Interpreter} interpreter - JS-Interpreter instance that will be used to construct the native Function.
         * @param {Function} funcRef - JavaScript Function that will be used during interpretation.
         * @param {Object} funcThis - this context for the funcRef JavaScript Function during interpretation.
         * @returns {Object} - JS-Interpreter native Function that can be attached to JS-Interpreter scope.
         */
        ParlayInterpreter.prototype.makeFunction = function (interpreter, funcRef, funcThis) {
            return interpreter.createNativeFunction(function () {
                funcRef.apply(!!funcThis ? funcThis : null, Array.prototype.slice.call(arguments).map(df_extract));
            });
        };

        /**
         * Creates and returns a JS-Interpreter Object that can be attached to a JS-Interpreter scope.
         * @param {JS-Interpreter} interpreter - JS-Interpreter instance that will be used to construct the native Function.
         * @param {Object} objectRef - JavaScript Object that will be used during interpretation.
         * @returns {Object} - JS-Interpreter Object that can be attached to a JS-Interpreter scope.
         */
        ParlayInterpreter.prototype.makeObject = function (interpreter, objectRef) {
            var obj = interpreter.createObject();

            var prop, prop_val;
            for (prop in objectRef) {
                prop_val = objectRef[prop];
                if (typeof prop_val == "function") {
                    interpreter.setProperty(obj, prop_val.name, this.makeFunction(interpreter, prop_val, objectRef));
                }
                else if (["string", "number", "boolean"].indexOf(typeof prop_val) > -1) {
                    interpreter.setProperty(obj, prop, interpreter.createPrimitive(prop_val));
                }
                else if (prop_val === null) {
                    interpreter.setProperty(obj, prop, interpreter.createPrimitive(null));
                }
            }

            return obj;
        };

        /**
         * Binds a property on the JS-Interpreter scope to the given JavaScript Function.
         * @param {JS-Interpreter scope} scope - Execution scope that the Function will be attached to.
         * @param {JS-Interpreter} interpreter - JS-Interpreter instance that will be used to attach the Function.
         * @param {Function} funcRef - JavaScript Function that will be used during interpretation.
         * @param {String} optionalName - If provided this will be the name used on the scope to reference the funcRef.
         */
        ParlayInterpreter.prototype.attachFunction = function (scope, interpreter, funcRef, optionalName) {
            var name = !!optionalName ? optionalName : funcRef.name;
            
            if (this.functionString.includes(name)) {
                interpreter.setProperty(scope, name, this.makeFunction(interpreter, funcRef));
            }
        };

        /**
         * Binds a property on the JS-Interpreter scope to the given JavaScript Object.
         * @param {JS-Interpreter scope} scope - Execution scope that the Object will be attached to.
         * @param {JS-Interpreter} interpreter - JS-Interpreter instance that will be used to attach the Object.
         * @param objectRef - JavaScript Object that will be used during interpretation.
         * @param {String} optionalName - If provided this will be the name used on the scope to reference the funcRef.
         */
        ParlayInterpreter.prototype.attachObject = function (scope, interpreter, objectRef, optionalName) {
            var name = !!optionalName ? optionalName : objectRef.constructor.name;

            if (this.functionString.includes(name)) {
                interpreter.setProperty(scope, name, this.makeObject(interpreter, objectRef));
            }
        };

        /**
         * Binds multiple properties on the JS-Interpreter scope.
         * @param {JS-Interpreter scope} scope - Execution scope that the Objects will be attached to.
         * @param {JS-Interpreter} interpreter - JS-Interpreter instance that will be used to attach the Objects.
         * @param {Array} items - Array of Objects that will be attached to the given scope.
         */
        ParlayInterpreter.prototype.attachItems = function (scope, interpreter, items) {
            items.forEach(function (item) {
                this.attachObject(scope, interpreter, item, item.name);
            }, this);
        };

        /**
         * Converts ParlayInterpreter instance to Object that can be JSON.strinfified.
         * @returns {{functionString: {String}}}
         */
        ParlayInterpreter.prototype.toJSON = function () {
            return {
                functionString: this.functionString
            };
        };
        
        return ParlayInterpreter;
    }
    
}());