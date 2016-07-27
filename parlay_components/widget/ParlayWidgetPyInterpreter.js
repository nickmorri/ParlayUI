(function () {
    "use strict";
    
    var module_dependencies = ["parlay.widget.interpreter", "promenade.broker",
        "parlay.utility.workerpool", "worker.imports"];
    
    angular
        .module("parlay.widget.interpreter.py", module_dependencies)
        .factory("ParlayPyInterpreter", ParlayPyInterpreterFactory);

    ParlayPyInterpreterFactory.$inject = ["ParlayInterpreter", "PromenadeBroker", "ParlayWorkerPool",
                                         "skulpt", "refreshRate", "parlayModules"];
    function ParlayPyInterpreterFactory (ParlayInterpreter, PromenadeBroker, ParlayWorkerPool,
                                         skulpt, refreshRate, parlayModules) {


        /** This Worker runs an individual Python script in a separate thread.
         * It is designed to be reusable to avoid repeated script imports.
         * Messages to this Worker should be Python scripts as strings.
         * Messages from this Worker will be Objects of one of the following forms:
         *  {messageType: "print", value: <text>}
         *  {messageType: "return"}
         *  {messageType: "error", value: <err>}
         */
        function pyWorker() {
            Sk.configure({
                output: print,
                read: builtinRead,
                setTimeout : self.setTimeout.bind(self)
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

            // onResponse is a custom function called when requested data is provided by the main application
            // scripts can override this to communicate with the main application
            self.onResponse = undefined;

            self.onmessage = function(e) {

                // data should be one of:
                //  -{script:<script>, ...}
                //  -{value: <val>, ...}
                var data = e.data;
                if (!!data.script) {
                    // if this worker receives a script, run it
                    Sk.misceval.asyncToPromise(function () {
                        return Sk.importMainWithBody("user-script", false, e.data.script, true);
                    }).then(ret, function (err) {
                        if (err instanceof Sk.builtin.BaseException) {
                            postMessage({messageType: "error", value: err.toString()});
                        } else {
                            throw err;
                        }
                    });
                } else {
                    // otherwise the input is not a script, so call the response handler
                    if (!!self.onResponse) {
                        self.onResponse(data.value);
                    }
                }
            };
        }
        //create a URL used to pass Skulpt and the Parlay modules to the worker script
        var libURL = URL.createObjectURL(new Blob([skulpt + parlayModules]), {
            type: 'application/javascript'
        });
        //create a URL used to pass the worker script to the Worker constructor as a Blob
        var blobURL = URL.createObjectURL(new Blob(['importScripts("' + libURL + '");(' + pyWorker + ')();']), {
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
                    case "pyMessage":
                        handlePyMessage(this, msg.value);
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
            undefined,
            // isComplete
            function(e) {
                if (e instanceof MessageEvent) {
                    var msg = e.data;
                    switch (msg.messageType) {
                        case "print":
                            return false;
                        case "pyMessage":
                            return false;
                        case "error":
                            return true;
                        case "return":
                            return true;
                        default :
                            return false;
                    }
                }
                return false;
            }
        );


        /**
         * Handles messages sent from Python scripts
         * To add messaging functionality to
         * @private
         * @param {Function} childInitFunc - Initialization function that is given access to the interpreter instance
         * and it's scope.
         *
         * Additionally it attaches a few Objects and functions that may be convenient for the end user.
         */
        function handlePyMessage(worker, data) {
            switch (data.command) {
                case "discover":
                    // request the discovery and return a boolean for the success
                    PromenadeBroker.requestDiscovery(data.force).then(
                        function (result) {
                            console.log(PromenadeBroker.getLastDiscovery());
                            worker.postMessage({value: null});
                        });
                    break;
                case "get_item":
                    worker.postMessage({value:(function (){
                        var discovery = PromenadeBroker.getLastDiscovery();
                        // search through the items in each device to find the one the script selected and return it
                        for (var i = 0; i < discovery.length; i++){
                            var children = discovery[i].CHILDREN;
                            for (var j = 0; j < children.length; j++) {
                                if (children[j][data.key] == data.value) {
                                    return children[j];
                                }
                            }
                        }
                        throw new Error("Requested item not found in discovery");
                    })()});
                    break;
                case "item_contents":
                    //TODO: returns dummy value for testing
                    worker.postMessage({value:"Hi there!"});
                    break;
                default:
                    break;
            }
        }

        //collect extra workers every minute
        (function collectionLoop() {
            setTimeout(collectionLoop, refreshRate);
            workerPool.collect();
        })();

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
                    workerPool.getWorker().postMessage({script: this.functionString});
                    //return true on successful launch
                    return true;
                }
        };

        return ParlayPyInterpreter;
    }
    
}());