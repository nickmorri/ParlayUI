"use strict";

// a module for testing Python scripts
function parlay_utils_native($modname) {
    var mod = {};

    // sends a one-way message to the main page
    mod.sendMessage = new Sk.builtin.func(function(data) {
        Sk.builtin.pyCheckArgs("sendMessage", arguments, 1, 1);
        self.postMessage({messageType: "pyMessage", value: Sk.ffi.remapToJs(data)});
        return Sk.builtin.null.null$;
    });

    //call this when the script is finished to free it and return it to the worker pool
    mod.scriptFinished = new Sk.builtin.func(function(data) {
        self.postMessage({messageType: "return", value: Sk.ffi.remapToJs(data)});
        //return Sk.builtin.null.null$;
    });

    mod.getWidgetProperty = new Sk.builtin.func(function(widget_name, prop_name){
        return sendQueryNative({
            command: "get_widget_property",
            widget_name: Sk.ffi.remapToJs(widget_name),
            property_name: Sk.ffi.remapToJs(prop_name)
        });
    });

    mod.setWidgetProperty = new Sk.builtin.func(function(widget_name, prop_name, value){
        return sendQueryNative({
            command: "set_widget_property",
            widget_name: Sk.ffi.remapToJs(widget_name),
            property_name: Sk.ffi.remapToJs(prop_name),
            value: Sk.ffi.remapToJs(value)
        });
    });

    // queries the main page for some information and waits for the response
    // we define a "native" JS version separately so that module-internal methods may call it
    // without the overhead of JS->Py->JS conversion.
    var sendQueryNative = function(data) {
        self.postMessage({messageType: "pyMessage", value: data});

        var result;
        var susp = new Sk.misceval.Suspension();

        // return the result of the query on resumption
        // the suspension should never resume before result is set, so throw an error if it does
        susp.resume = function() {
            return result;
        };

        // attach the resolution of the program to receiveResponse
        susp.data = {type: "Sk.promise", promise: new Promise(function(resolve) {
            self.onResponse = function (data) {
                // stores the result of the query so that it will be returned by resume()
                result = Sk.ffi.remapToPy(data);

                // accepts exactly one response
                self.onResponse = undefined;
                resolve();
            }
        })};
        return susp;
    }

    // sendQuery wraps sendQueryNative with the necessary input checking and conversion to expose it to Python
    mod.sendQuery = new Sk.builtin.func(function(data) {
        Sk.builtin.pyCheckArgs("sendMessage", arguments, 1, 1);
        Sk.builtin.pyCheckType("data", "dict", data instanceof Sk.builtin.dict);
        Sk.builtin.pyCheckType("data['command']", "str",
            Sk.builtin.checkString(data.mp$lookup(new Sk.builtin.str("command"))));
        return sendQueryNative(Sk.ffi.remapToJs(data));
    });

    mod.ProxyItem = Sk.misceval.buildClass(mod, function($gbl, $loc) {

        $loc.__init__ = new Sk.builtin.func(function (self, desc) {
            Sk.builtin.pyCheckArgs("ProxyItem.__init__", arguments, 2, 2);
            Sk.builtin.pyCheckType("desc", "dict", desc instanceof Sk.builtin.dict);

            // we map content fields to proxy methods, so check that the description specifies them
            var contentFields = desc.mp$subscript(new Sk.builtin.str("CONTENT_FIELDS"));
            Sk.builtin.pyCheckType("desc['CONTENT_FIELDS']", "list", contentFields instanceof Sk.builtin.list);

            // we expose properties, so check that the description specifies them
            var properties = desc.mp$subscript(new Sk.builtin.str("PROPERTIES"));
            Sk.builtin.pyCheckType("desc['PROPERTIES']", "list", properties instanceof Sk.builtin.list);

            // we expose datastreams, so check that the description specifies them
            var datastreams = desc.mp$subscript(new Sk.builtin.str("DATASTREAMS"));
            Sk.builtin.pyCheckType("desc['DATASTREAMS']", "list", datastreams instanceof Sk.builtin.list);

            var itemName = desc.mp$subscript(new Sk.builtin.str("NAME"));
            Sk.builtin.pyCheckType("desc['NAME']", "str", Sk.builtin.checkString(itemName));

            var itemID = desc.mp$subscript(new Sk.builtin.str("ID"));

            // create a local Map to hold command and property data
            var fields = new Map();//TODO: add property data

            // convert the itemID to Js for ease-of-access
            var itemIDJS = Sk.ffi.remapToJs(itemID);

            // takes a Parlay Message input type and a Python value and checks that the value matches the type
            function checkInputType(name, inputType, val) {
                //TODO: check all types
                switch (inputType) {
                    case "STRING":
                        Sk.builtin.pyCheckType(name, "str", Sk.builtin.checkString(val));
                        break;
                    default:
                        break;
                }
            }


            // takes a command and a sequential list of its arguments
            // and returns a dictionary mapping argument names to values
            // this is the CONTENTS section of a Parlay message
            function sequentialToDict(cmd, args, kwargs) {
                if(kwargs === undefined) kwargs = []; //default to empty kwargs list
                var contents = {'COMMAND': cmd};
                //assume that cmd is a valid command
                var fieldArgs = fields.get(cmd);

                // check that the arguments are of the appropriate types and put them into contents
                Array.prototype.map.call(args, function(arg, i) {
                    var argDef = fieldArgs[i];
                    //checkInputType(argDef.name, argDef.type, arg);

                    contents[argDef.name] = Sk.ffi.remapToJs(arg);
                });

                //now add the kwargs
                for(var k in kwargs)
                {
                    if(kwargs.hasOwnProperty(k))
                    {
                        //bug with kwargs where we get nromal JS strings instead of python strings for values.
                        contents[k] = typeof kwargs[k] === "string" ? kwargs[k] : Sk.ffi.remapToJs(kwargs[k]);
                    }
                }

                return contents;
            }

            Sk.ffi.remapToJs(datastreams).map(function(stream) {
                fields.set(stream.ATTR_NAME, {
                    dataType: "datastream",
                    datastream: stream.STREAM
                });
            });

            Sk.ffi.remapToJs(properties).map(function(prop) {
                fields.set(prop.ATTR_NAME, {
                    dataType: "property",
                    readOnly: prop.READ_ONLY,
                    writeOnly: prop.WRITE_ONLY,
                    type: prop.INPUT,
                    property: prop.PROPERTY
                });
            });

            // synchronous parlay commands
            // convert the content fields to JS for ease-of-access
            Sk.ffi.remapToJs(contentFields).map(function(field) { field.DROPDOWN_OPTIONS.map(function(opt, i) {
                // get the arguments for the command represented by opt
                var args = field.DROPDOWN_SUB_FIELDS[i].map(function (arg) {
                    return {name: arg.MSG_KEY, type: arg.INPUT};
                });
                args.dataType = "command";

                // Store the list of arguments and their types for this command
                fields.set(opt[0], args);

                // add this command to this object so that it may be called
                var command = function (kwa) {
                    Sk.builtin.pyCheckArgs(itemIDJS + "." + opt[0], arguments, 0, Infinity, true, false);
                    var kwargs = Sk.ffi.remapToJs(new Sk.builtins['dict'](kwa)); //turn it into a dict then map to JS obj
                    var args = Array.prototype.slice.call(arguments, 1); //slice off only the variable length args

                    return sendQueryNative({"command": "item_contents",
                        "item": itemIDJS,

                        "contents": sequentialToDict(opt[0], args, kwargs) });
                };
                command["co_kwargs"] = true;

                self.$d.mp$ass_subscript(new Sk.builtin.str(opt[0]), new Sk.builtin.func(command));
            })});

            // asynchronous parlay commands
            self.$d.mp$ass_subscript(new Sk.builtin.str("send_parlay_command"), new Sk.builtin.func(function(cmd) {
                //TODO: optional arguments
                //TODO: keyword arguments
                // check that we have the minimum number of arguments (1 command)
                Sk.builtin.pyCheckArgs(itemIDJS + "send_parlay_command", arguments, 1, Infinity);
                Sk.builtin.pyCheckType("cmd", "str", Sk.builtin.checkString(cmd));

                // load the command arguments and check that they exist
                var commandJS = Sk.ffi.remapToJs(cmd);
                var argData = fields.get(commandJS);
                if (argData === undefined) {
                    throw new Sk.builtin.AttributeError(itemIDJS + " does not have a " + cmd + " command.");
                }

                // get the arguments for the command
                var args = Array.prototype.slice.call(arguments, 1);

                // check that this funciton was passed the right number of arguments
                Sk.builtin.pyCheckArgs("send_parlay_command: " + itemIDJS + "." + commandJS,
                    args, argData.length, argData.length);

                return Sk.misceval.callsim(mod.ProxyCommand, itemID, cmd,
                    Sk.ffi.remapToPy(sequentialToDict(Sk.ffi.remapToJs(cmd), args)));

            }));



            self.tp$setattr("__getattr__", new Sk.builtin.func(function (name) {
                Sk.builtin.pyCheckArgs("__getattr__", arguments, 1, 1);
                Sk.builtin.pyCheckType("name", "str", Sk.builtin.checkString(name));

                var nameJS = Sk.ffi.remapToJs(name);
                var fieldData = fields.get(nameJS);

                if (fieldData === undefined) {
                    throw new Sk.builtin.AttributeError(itemIDJS + " does not have a " + nameJS
                        + " property or datastream.");

                } else if (fieldData.dataType === "property") {
                    if (fieldData.writeOnly) {
                        throw new Sk.builtin.AttributeError(itemIDJS + "." + nameJS
                            + " is a write-only property.");
                    }

                    return sendQueryNative({
                        'command': "item_property",
                        'operation': "get",
                        'item': itemIDJS,
                        'property': fieldData.property});

                } else if (fieldData.dataType === "datastream") {
                    return Sk.misceval.callsim(mod.ProxyDatastream,
                        itemID, new Sk.builtin.str(fieldData.datastream));//TODO: args
                } else {
                    throw new Sk.builtin.AttributeError(itemIDJS + "." + nameJS
                        + " is a " + fieldData.dataType + ", not a property or datastream.");
                }

            }));

            // parlay attributes
            self.tp$setattr("__setattr__", new Sk.builtin.func(function (name, data) {
                Sk.builtin.pyCheckArgs("__setattr__", arguments, 2, 2);
                Sk.builtin.pyCheckType("name", "str", Sk.builtin.checkString(name));

                var nameJS = Sk.ffi.remapToJs(name);
                var propData = fields.get(nameJS);

                // if we couldn't locate the given name, it does not refer to a property,
                //   or that property is read-only, error
                if (propData === undefined) {
                    //if(nameJS.startsWith("__")) return; // we're erroring out here trying to use setattr to set getattr? is this a new skulpt bug?
                    throw new Sk.builtin.AttributeError(itemIDJS + " does not have a " + nameJS + " property.");
                } else if (propData.dataType !== "property") {
                    throw new Sk.builtin.AttributeError(itemIDJS + "." + nameJS
                        + " is a " + propData.dataType + ", not a property.");
                } else if (propData.readOnly) {
                    throw new Sk.builtin.AttributeError(itemIDJS + "." + nameJS
                        + " is a read-only property.");
                }

                checkInputType(nameJS, propData.type, data);

                //TODO: determine whether name is a property or data stream

                return sendQueryNative({
                    'command': "item_property",
                    'operation': "set",
                    'item': itemIDJS,
                    'property': Sk.ffi.remapToJs(name),
                    'value': Sk.ffi.remapToJs(data)});
            }));



        });

    }, "ProxyItem", []);

    mod.ProxyDatastream = Sk.misceval.buildClass(mod, function($gbl, $loc) {

        $loc.__init__ = new Sk.builtin.func(function (self, item, stream) {

            Sk.builtin.pyCheckArgs("ProxyDatastream.__init__", arguments, 3, 3);

            self.itemJS = Sk.ffi.remapToJs(item);
            self.streamJS = Sk.ffi.remapToJs(stream);

            sendQueryNative({
                command: "item_datastream",
                item: self.itemJS,
                datastream: self.streamJS,
                operation: "listen"
            });

        });

        $loc.get = new Sk.builtin.func(function (self) {
            Sk.builtin.pyCheckArgs("ProxyDatastream.get", arguments, 1, 1);
            return sendQueryNative({
                command: "item_datastream",
                item: self.itemJS,
                datastream: self.streamJS,
                operation: "get"
            });
        });

        $loc.wait_for_value = new Sk.builtin.func(function (self) {
            Sk.builtin.pyCheckArgs("ProxyDatastream.wait_for_value", arguments, 1, 1);
            return sendQueryNative({
                command: "item_datastream",
                item: self.itemJS,
                datastream: self.streamJS,
                operation: "wait_for_value"
            });
        });

        $loc.attach_listener = new Sk.builtin.func(function (self, listener) {
            Sk.builtin.pyCheckArgs("ProxyDatastream.attach_listener", arguments, 2, 2);
            Sk.builtin.pyCheckType("listener", "func", listener instanceof Sk.builtin.func);

            var listenerID = newListenerID();

            // add the Python listener, wrapped in a JS function
            listeners.set(listenerID, function(data) {
                // call the Python listener and keep its result
                var doRemove = Sk.misceval.callsim(listener, Sk.ffi.remapToPy(data));

                // if the listener returns true, it should be removed
                if (Sk.ffi.remapToJs(doRemove)) {
                    listeners.delete(listenerID);
                    // tell the main app to stop listening to the datastream for this listener
                    sendQueryNative({
                        command: "item_datastream",
                        item: self.itemJS,
                        datastream: self.streamJS,
                        operation: "detach_listener",
                        listener: listenerID
                    });
                }

            });

            // send the listener attachment request to the main app
            // so that the main app will connect to the server
            return sendQueryNative({
                command: "item_datastream",
                item: self.itemJS,
                datastream: self.streamJS,
                operation: "attach_listener",
                listener: listenerID
            });
        });


    }, "ProxyDatastream", []);

    mod.ProxyCommand = Sk.misceval.buildClass(mod, function($gbl, $loc) {



        $loc.__init__ = new Sk.builtin.func(function (self, itm, cmd, argsDict) {

            Sk.builtin.pyCheckArgs("ProxyCommand.__init__", arguments, 3, 4);
            Sk.builtin.pyCheckType("itm", "str", Sk.builtin.checkString(itm));
            Sk.builtin.pyCheckType("cmd", "str", Sk.builtin.checkString(cmd));

            // if there is an argsDict, check its type and convert it to JS. Otherwise, use an empty Object.
            var argsDictJS;
            if (argsDict) {
                Sk.builtin.pyCheckType("argsDict", "dict", argsDict instanceof Sk.builtin.dict);
                argsDictJS = Sk.ffi.remapToJs(argsDict);
            } else {
                argsDictJS = {};
            }


            var item = Sk.ffi.remapToJs(itm);
            self.command = Sk.ffi.remapToJs(cmd);
            // provided by the worker
            self.listenerID = newListenerID();
            listeners.set(self.listenerID, function (val) {
                // remove the listener since we've received the message
                listeners.delete(self.listenerID);
                // set result so that wait_for_complete can return it
                self.result = Sk.ffi.remapToPy(val);
            });
            argsDictJS.COMMAND =  self.command;
            postMessage({messageType: "pyMessage", value: {
                "command": "item_contents",
                "item": item,
                "contents": argsDictJS,
                "listener": self.listenerID
            }});
        });

        $loc.wait_for_complete = new Sk.builtin.func(function (self) {
            // if we have the result, we don't need to suspend
            if (!!self.result) {
                return self.result;
            }
            var susp = new Sk.misceval.Suspension();

            // return the result of the command on resumption
            // the suspension should never resume before result is set, so throw an error if it does
            susp.resume = function() {
                if (!!self.result) {
                    return self.result;
                } else {
                    throw new Error("Suspension for command '" + self.command
                        +"' resumed before result was retrieved! This should never happen.");
                }
            };

            // replace the old listener with one that resolves the suspension
            susp.data = {type: "Sk.promise", promise: new Promise(function(resolve) {
                listeners.set(self.listenerID, function (val) {
                    // remove the listener since we've received the message
                    listeners.delete(self.listenerID);
                    // stores the result of the query so that it will be returned by resume()
                    self.result = Sk.ffi.remapToPy(val);

                    if (!!onResponse) {
                        throw new Error("Attempting to simultaneously resolve two code paths. This should never happen.");
                    }

                    resolve();
                });
            })};
        });

    }, "ProxyCommand", []);

    return mod;
}