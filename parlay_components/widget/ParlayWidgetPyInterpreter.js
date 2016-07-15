(function () {
    "use strict";
    
    var module_dependencies = ["parlay.widget.interpreter", "parlay.socket", "parlay.widget.workerpool"];
    
    angular
        .module("parlay.widget.interpreter.py", module_dependencies)
        .factory("ParlayPyInterpreter", ParlayPyInterpreterFactory);

   ParlayPyInterpreterFactory.$inject = ["ParlayInterpreter", "ParlaySocket", "ParlayWorkerPool"];
    function ParlayPyInterpreterFactory (ParlayInterpreter, ParlaySocket, ParlayWorkerPool) {


        /** This Worker runs an individual Python script in a separate thread.
         * It is designed to be reusable to avoid repeated script imports.
         * Messages to this Worker should be Python scripts as strings.
         * Messages from this Worker will be Objects of one of the following forms:
         *  {messageType: "print", value: <text>}
         *  {messageType: "return"}
         *  {messageType: "error", value: <err>}
         */
        function pyWorker() {
            importScripts("https://raw.githubusercontent.com/skulpt/skulpt-dist/master/skulpt.min.js",
                "https://raw.githubusercontent.com/skulpt/skulpt-dist/master/skulpt-stdlib.js");

            Sk.configure({
                output: print,
                read: builtinRead
            });

            function print(text) {
                postMessage({messageType: "print", value: text});
            }

            function builtinRead(x) {
                if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[x] === undefined)
                    throw "File not found: '" + x + "'";
                return Sk.builtinFiles.files[x];
            }

            //The return continuation, to be called after running a Python script to pass the result
            // back to the user.
            // Indicates that this worker is now idle.
            function ret() {
                 postMessage({messageType: "return"});
            }

            // Indicates that this worker is now idle.
            self.onerror = function(err) {
                 postMessage({messageType: "error", value: err});
            };

            self.onmessage = function(e) {
                Sk.misceval.asyncToPromise(function () {
                    return Sk.importMainWithBody("user-script", false, e.data, true);
                }).then(ret, function (err) {
                    //TODO: is err an error?/Does this do what I want?
                    if (err instanceof Sk.builtin.BaseException) {
                        postMessage({messageType: "error", value: err});
                    } else {
                        throw err;
                    }
                });
            };
        }

        //create a URL used to pass the Blob to the Worker constructor
        var blobURL = URL.createObjectURL(new Blob(['(' + pyWorker + ')();']), {
            type: 'application/javascript'
        });

        var workerPool = new ParlayWorkerPool();
        workerPool.initialize(blobURL,
            //handle 3 kinds of valid messages: print, error, and return
            // onmessage
            function(e) {
                var msg = e.data;
                switch(msg.messageType) {
                    case "print":
                        console.log(msg.value);
                        break;
                    case "error":
                        throw msg.value;
                    case "return":
                        return;
                    default :
                        return;
                }
            },
            // onerror
            function(e) {
                console.log(e);
            },
            // isComplete
            function(e) {
                var msg = e.data;
                //TODO: account for errors (done?)
                switch(msg.messageType) {
                    case "print":
                        return false;
                    case "error":
                        return true;
                    case "return":
                        return true;
                    default :
                        return false;
                }
            }
        );

        /**
         * ParlayPyInterpreter factory for running arbitrary Python code in a separate thread.
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
            ParlayInterpreter.call(this);
        }

        //Inherit from ParlayInterpreter
        ParlayPyInterpreter.prototype = Object.create(ParlayInterpreter.prototype);
        ParlayPyInterpreter.prototype.constructor = ParlayPyInterpreter;

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
            this.pyWorker = workerPool.getWorker();

        };


        /**
         * Attempts to run the Python script.
         * @member module:ParlayWidget.ParlayPyInterpreter#run
         * @public
         * @returns {Object} - true or error
         */
        ParlayPyInterpreter.prototype.run = function() {
            if (!!this.constructionError) {
                    return this.constructionError;
                }
                else if (!this.functionString) {
                    return "ParlayInterpreter.construct() must be done before ParlayInterpreter.run()";
                }
                else {
                    this.pyWorker.postMessage(this.functionString);
                    //return true on successful launch
                    return true;
                }
        };

        return ParlayPyInterpreter;
    }
    
}());