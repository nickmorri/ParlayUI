(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("mock.parlay.widget.interpreter.py", module_dependencies)
        .factory("ParlayPyInterpreter", ParlayPyInterpreterFactory);

    ParlayPyInterpreterFactory.$inject = ["$rootScope"];
    function ParlayPyInterpreterFactory ($rootScope) {


        /**
         * ParlayPyInterpreter factory for running arbitrary Python code in a separate thread.
         *
         * Uses Skulpt for translation from Python to Javascript
         * and [JS-Interpreter]{@link https://github.com/NeilFraser/JS-Interpreter/} internally for code execution.
         * @constructor module:ParlayWidget.ParlayPyInterpreter
         * @attribute {String} functionString - JavaScript code that should be executed on this.run()
         * @attribute {String} constructionError - Initially undefined, if a construction error occurs it will be set
         * error.toString() representation.
         */
        function ParlayPyInterpreter () {
            /**
             * Statement to be interpreted.
             * @member module:ParlayWidget.ParlayInterpreter#functionString
             * @public
             * @type {String}
             * @default {undefined}
             */
            this.functionString = "from parlay.utils import *\nfrom parlay import widgets\nsetup()\n\n"; //default the imports to make it easier

            /**
             * Set if a error occurs during the interpreter construction process.
             * @member module:ParlayWidget.ParlayInterpreter#constructionError
             * @public
             * @type {String}
             * @default {undefined}
             */
            this.constructionError = undefined;
        }

        /**
         * Attempts to construct a python interpreter instance using functionString and the given childInitFunc.
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

        };


        /**
         * Attempts to run the Python script.
         * @member module:ParlayWidget.ParlayPyInterpreter#run
         * @public
         * @param {Function} onFinished - callback function to call when finished
         * @param {Object} builtins - extra builtins to add to the environment
         * @returns {Object} - true or error
         */
        ParlayPyInterpreter.prototype.run = function(onFinished, builtins) {
            if (!!this.constructionError) {
                return this.constructionError;
            }
            else if (!this.functionString) {
                return "ParlayInterpreter.construct() must be done before ParlayInterpreter.run()";
            }
            else {
                onFinished(true); //mock the finished call
                //return true on successful launch
                return true;
            }
        };

        /**
         * Converts ParlayPyInterpreter instance to Object that can be JSON.stringified.
         * @member module:ParlayWidget.ParlayPyInterpreter#toJSON
         * @public
         * @returns {{functionString: {String}}}
         */
        ParlayPyInterpreter.prototype.toJSON = function () {
            return {
                functionString: this.functionString
            };
        };

        return ParlayPyInterpreter;
    }

}());