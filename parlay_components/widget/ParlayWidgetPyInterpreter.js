(function () {
    "use strict";
    
    var module_dependencies = ["promenade.broker",
        "parlay.utility.workerpool",
        "worker.imports",
        "parlay.data",
    "parlay.notification.error",
    "parlay.notification"];
    
    angular
        .module("parlay.widget.interpreter.py", module_dependencies)
        .factory("ParlayPyInterpreter", ParlayPyInterpreterFactory);

    ParlayPyInterpreterFactory.$inject = ["PromenadeBroker","ParlayWorkerPool",
                                            //Note: The "skulpt" constant is provided by worker.imports.
                                            //      The skulpt library is never loaded by the main application.
                                            "skulpt",
                                            "refreshRate", "parlayModules", "ParlayData", "ParlayErrorDialog", "ParlayNotification", "$rootScope"];
    function ParlayPyInterpreterFactory (PromenadeBroker, ParlayWorkerPool,
                                         skulpt, refreshRate, parlayModules, ParlayData, ParlayErrorDialog, ParlayNotification, $rootScope) {

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
            //shallow clone the builtins so they're pristine (we'll be messing with them)
            var default_builtins = {} ;
            var key;
            for (key in Sk.builtins)
            {
                // copy each property into the clone
                default_builtins[key] = Sk.builtins[key] ;
            }

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
            // Indicates that this worker is now idle if it does not have any listeners.
            function ret() {
                // if there are no listeners, the script is done
                if (self.listeners.length === 0) {
                    postMessage({messageType: "return"});
                // otherwise, wait a bit and try again
                }
            }

            // onResponse is a custom function called when requested data is provided by the main application
            // scripts can override this to communicate with the main application
            self.onResponse = undefined;

            // generates new IDs for listeners from this script
            // each listener has an associated ID that identifies it to the main application
            self.newListenerID = (function() {
                var nextID = 0;
                return function() { return nextID++; };
            })();

            // listeners maps listener IDs to the associated listener functions
            // listeners are responsible for removing themselves once they are done listening
            self.listeners = new Map();

            self.onmessage = function(e) {
                // data should be one of:
                //  -{script:<script>, ...}
                //  -{value: <val>, ...}
                // -{listener:<listenerID>, value: <val>, ...}
                var data = e.data;

                // if the data is a script, run it
                if (!!data.script) {
                    //clear listeners for new script
                    self.onResponse = undefined;
                    self.listeners.clear();
                    //reset builtins and add any builtins we need
                    Sk.builtins = {};
                    for (var key in default_builtins)
                    {
                        // copy each property into the clone
                        Sk.builtins[key] = default_builtins[key];
                    }
                    //add any builtins we need
                    for(key in e.data.builtins){
                        Sk.builtins[key] = Sk.ffi.remapToPy(e.data.builtins[key]);
                    }

                    // if this worker receives a script, run it
                    Sk.misceval.asyncToPromise(function () {
                        return Sk.importMainWithBody("user-script", false, e.data.script, true);
                    }).then(ret, function (err) {
                        if (err instanceof Sk.builtin.BaseException) {
                            //TODO: traceback works?
                            postMessage({messageType: "error", value: err.toString(), traceback: JSON.stringify(err.traceback)});
                        } else {
                            //TODO: should we really throw the error? errors should never be thrown by a worker (pool can't tell)
                            throw err;
                        }
                    });

                // if the data is for a listener, send it to the right listener
                // data.listener is a numeric ID, so we can't use !!data.listener (it might be 0)
                } else if (data.listener !== undefined) {
                    var listener = self.listeners.get(data.listener);
                    // sometimes a few messages make it through during listener deregistration.
                    // Drop them if the listener does not expect them.
                    if (!!listener) {
                        listener(data.value);
                    }

                // otherwise the input is a query response, so call the response handler if there is one
                } else if (!!self.onResponse) {
                    self.onResponse(data.value);
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

        var workerPool = new ParlayWorkerPool(40); // max 40 workers
        workerPool.initialize(blobURL,
            // onmessage
            function(e) {
                var msg = e.data;
                switch(msg.messageType) {
                    case "print":
                        //ignore empty messages
                        if(msg.value === "" || msg.value === "\n") return;
                        ParlayNotification.show({content:msg.value, hideDelay: 75 * msg.value.length + 500});
                        console.log(msg.value);
                        break;
                    case "pyMessage":
                        handlePyMessage(this, msg.value);
                        break;
                    case "error":
                        this.onerror(msg);
                        //throw msg.value;
                        break;
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
                    var complete = msg.messageType === "error" || msg.messageType === "return";
                    if(complete) // run our onFinished if we're complete
                    {
                        if(this.onFinished !== undefined) this.onFinished(msg.value);
                        this.onFinished = undefined;
                    }
                    return complete;

                }
                return false;
            }
        );

        /**
         * Handles messages sent from Python scripts
         * @private
         * @param {Worker} worker - the JS Worker handling the message and responsible for receiving a response
         * @param {Object} data - the message data to process
         *
         */
        function handlePyMessage(worker, data) {
            switch (data.command) {
                case "discover":
                    // request the discovery
                    PromenadeBroker.requestDiscovery(data.force).then(
                        function (result) {
                            worker.postMessage({value: null});
                        });
                    break;
                case "get_item":
                    worker.postMessage({value:(function (){
                        var discovery = PromenadeBroker.getLastDiscovery();
                        var children;
                        // search through the items in each device to find the one the script selected and return it
                        if (!!discovery) {
                            for (var i = 0; i < discovery.length; i++) {
                                children = discovery[i].CHILDREN;
                                for (var j = 0; j < children.length; j++) {
                                    if (children[j][data.key] === data.value) {
                                        return children[j];
                                    }
                                }
                            }
                        }
                        return null;
                        // throw new Error("Requested item not found in discovery");
                    })()});
                    break;
                case "item_contents"://TODO: change to 'command'?
                    //TODO: type of data is temporary
                    ParlayData.get(data.item + "." + data.contents.COMMAND).sendCommand(data.contents)
                        .then(function (result) {
                            // if data.listener is undefined, listener will be too
                            // so !!listener will still be false
                            worker.postMessage({value: result.CONTENTS.RESULT, listener: data.listener});
                        });
                    break;
                case "item_property":
                    var propObj = ParlayData.get(data.item + "." + data.property + "_property");
                    (data.operation === "set" ? propObj.set(data.value) : propObj.get())
                        .then(function (result) {
                            var res = result.CONTENTS.VALUE;
                            // if res is undefined, that means there is no result.
                            // Python expects null for no result.
                            // we check res !== undefined rather than !!res
                            //   because we want to send false if we receive it.
                            worker.postMessage({value: res !== undefined ? res : null});
                        });
                    break;
                case "item_datastream":
                    var datastream = ParlayData.get(data.item + "." + data.datastream);

                    switch (data.operation) {
                        case "listen":
                            datastream.listen();//TODO: ever stop listening?
                            break;
                        case "get":
                            // Python expects null, not undefined
                            worker.postMessage({value: datastream.value !== undefined ? datastream.value : null});
                            break;
                        case "wait_for_value":
                            datastream.listen().then(function(result) {
                                worker.postMessage({value: result.CONTENTS.VALUE});
                            });
                            break;
                        case "attach_listener":
                            // if the worker doesn't have a deregistration map, create it
                            worker.listenerDeregistration = worker.listenerDeregistration || new Map();

                            // register the listener with the datastream
                            // and store its deregistration function in the map
                            worker.listenerDeregistration.set(data.listener,
                                datastream.onChange(function(value) {
                                    worker.postMessage({value: value, listener: data.listener});
                            }));
                            // return control to the worker
                            worker.postMessage({value:null});
                            break;
                        case "detach_listener":
                            // call the deregistration function and remove it
                            worker.listenerDeregistration.get(data.listener)();
                            worker.listenerDeregistration.delete(data.listener);
                            // return control to the worker
                            worker.postMessage({value:null});
                            break;
                        default:
                            break;
                    }
                    break;
                case "get_widget_property":
                    //get the value out of the scope.properties object
                    var val = ParlayData.get("widgets_scope_by_name")[data.widget_name].properties[data.property_name].value;
                    worker.postMessage({value:val});
                    break;

                case "set_widget_property":
                    ParlayData.get("widgets_scope_by_name")[data.widget_name].properties[data.property_name].value = data.value;
                    worker.postMessage({value: data.value});
                    // since we've changed the ParlayData, do a digest loop
                    $rootScope.$digest();
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
        ParlayPyInterpreter.prototype.run = function(onFinished, builtins, on_error) {

            if (!!this.constructionError) {
                    return this.constructionError;
                }
                else {
                    //attach the prefix and suffix  to the string to run
                    //if there is no function string, then don't bother running it
                    if(this.functionString === "" || this.functionString === undefined)
                    {
                        if(onFinished) onFinished(undefined); //we're already finished
                        return true;
                    }

                    var full_func_string = this.functionString +
                        "\nfrom parlay.utils.native import scriptFinished" +
                        "\ntry:\n    scriptFinished(result)"+ // try and return wth value 'result'
                        "\nexcept:\n    scriptFinished(None)"; //else return wth no result
                    var worker = workerPool.getWorker();

                    if(worker === undefined) {
                        console.log("background worker pool running out.");
                        ParlayErrorDialog.show("PyInterpreter", "Background worker pool ran out.", "Widget Scripts are taking too long");
                        return "Could not get worker";
                    }
                    //launch a dialog on error by default
                    if(on_error === undefined)
                        worker.onerror = function(msg) { ParlayErrorDialog.show("Python", msg.value, JSON.parse(msg.traceback)); };
                    else
                        worker.onerror =on_error;

                    worker.onFinished = onFinished;
                    builtins = builtins || {};
                    worker.postMessage({script: full_func_string, builtins:builtins});
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