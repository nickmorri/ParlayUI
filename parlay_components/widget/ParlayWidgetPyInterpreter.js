(function () {
    "use strict";
    
    var module_dependencies = ["parlay.widget.interpreter", "parlay.socket"];
    
    angular
        .module("parlay.widget.interpreter.py", module_dependencies)
        .factory("ParlayPyInterpreter", ParlayPyInterpreterFactory);

   ParlayPyInterpreterFactory.$inject = ["ParlayInterpreter", "ParlaySocket"];
    function ParlayPyInterpreterFactory (ParlayInterpreter, ParlaySocket) {

        function builtinRead(x) {
            if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
                throw "File not found: '" + x + "'";
            return Sk.builtinFiles["files"][x];
        }

        function runPyFun(skFun) {
            return skFun.code + skFun.funcname + "();";
        }

        /**
         * ParlayPyInterpreter factory for running arbitrary Python code in a sandboxed JavaScript interpreter.
         *
         * Uses Skulpt for translation from Python to Javascript
         * and [JS-Interpreter]{@link https://github.com/NeilFraser/JS-Interpreter/} internally for code execution.
         * @constructor module:ParlayWidget.ParlayPyInterpreter
         * @attribute {String} functionString - JavaScript code that should be executed on this.run()
         * @attribute {Object} interpreter - [JS-Interpreter]{@link https://github.com/NeilFraser/JS-Interpreter/} instance.
         * @attribute {String} constructionError - Initially undefined, if a construction error occurs it will be set
         * error.toString() representation.
         */
        function ParlayPyInterpreter () {
            ParlayInterpreter.call(this)
        }

        //Inherit from ParlayInterpreter
        ParlayPyInterpreter.prototype = Object.create(ParlayInterpreter.prototype)
        ParlayPyInterpreter.prototype.constructor = ParlayPyInterpreter

        /**
         * Attempts to construct a [JS-Interpreter]{@link https://github.com/NeilFraser/JS-Interpreter/} instance using functionString and the given childInitFunc.
         * If construction fails constructionError will be set to the String representation of the caught error.
         * @member module:ParlayWidget.ParlayPyInterpreter#construct
         * @public
         * @param {Function} childInitFunc - Initialization function that is given access to the interpreter instance
         * and it's scope.
         *
         * Additionally it attaches a few Objects and functions that may be convenient for the end user.
         */
        ParlayPyInterpreter.prototype.construct = function (childInitFunc) {
            this.constructionError = undefined;

            if (!this.functionString) {
                this.constructionError = "Editor is empty. Please enter a valid statement.";
            }
            else {
                Sk.resetCompiler();
                //TODO: need to set Sk.pre?
                // configure Skulpt so that the output of the translation is passed to the JS-Interpreter
                Sk.configure({output: console.log.bind(console), read:builtinRead});

                try {
                    // "single" parameter does nothing, but is expected by the Sk.compile documentation
                    this.jsCode = runPyFun(Sk.compile(this.functionString, "user-script", "single"));
                }
                catch (error) {
                    this.constructionError = error.toString();
                }

            }

        };

    /**
     * Attempts to run the constructed JavaScript.
     * @member module:ParlayWidget.ParlayPyInterpreter#run
     * @public
     * @returns {Object} - Result of Python script or error
     */
    ParlayPyInterpreter.prototype.run = function() {
        if (!!this.constructionError) {
                return this.constructionError;
            }
            else if (!this.jsCode) {
                return "ParlayInterpreter.construct() must be done before ParlayInterpreter.run()";
            }
            else {
                try {
                    //eval is safe because the generated code does not use the external namespace
                    //TODO: check that return data represents the python data
                    return eval(this.jsCode);
                }
                catch (error) {
                    return error.toString();
                }
            }
    }

        return ParlayPyInterpreter;
    }
    
}());