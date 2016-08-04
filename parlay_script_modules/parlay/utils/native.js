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

    // queries the main page for some information and waits for the response
    // we define a "native" JS version separately so that module-internal methods may call it
    // without the overhead of jS->Py->JS conversion.
    // parseResponse allows native functions to interpret the received data
    // parseResponse should return a Python result
    var sendQueryNative = function(data, parseResponse) {
        self.postMessage({messageType: "pyMessage", value: data});

        var result;
        var susp = new Sk.misceval.Suspension();

        // return the result of the query on resumption
        // the suspension should never resume before result is set, so throw an error if it does
        susp.resume = function() {
            if (!!result) {
                return result;
            } else {
                throw new Error("sendQuery suspension resumed before result was retrieved! This should never happen.");
            }
        }

        // attach the resolution of the program to receiveResponse
        susp.data = {type: "Sk.promise", promise: new Promise(function(resolve) {
            self.onResponse = function (data) {
                // stores the result of the query so that it will be returned by resume()
                if (!!parseResponse) {
                    result = parseResponse(data);
                } else {
                    result = Sk.ffi.remapToPy(data);
                }
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

            var itemName = desc.mp$subscript(new Sk.builtin.str("NAME"));
            Sk.builtin.pyCheckType("desc['NAME']", "str", Sk.builtin.checkString(itemName));

            var itemID = desc.mp$subscript(new Sk.builtin.str("ID"));
            Sk.builtin.pyCheckType("desc['ID']", "str", Sk.builtin.checkString(itemID));

            // create a local Map to hold command and property data
            var fields = new Map();//TODO: add property data

            // convert the itemID to Js for ease-of-access
            var itemIDJS = Sk.ffi.remapToJs(itemID);

            // takes a command and a sequential list of its arguments
            // and returns a dictionary mapping argument names to values
            // this is the CONTENTS section of a Parlay message
            function sequentialToDict(cmd, args) {

                var contents = {'COMMAND': cmd};

                //assume that cmd is a valid command
                var fieldArgs = fields.get(cmd);

                // check that the arguments are of the appropriate types and put them into contents
                Array.prototype.map.call(args, function(arg, i) {
                    var argDef = fieldArgs[i];
                    //TODO: check all types
                    switch (argDef.type) {
                        case "STRING":
                            Sk.builtin.pyCheckType(argDef.name, "str", Sk.builtin.checkString(arg));
                            break;
                        default:
                            break;
                    }
                    contents[argDef.name] = Sk.ffi.remapToJs(arg);
                });

                return contents;
            };

            // synchronous parlay commands
            // convert the content fields to JS for ease-of-access
            Sk.ffi.remapToJs(contentFields).map(function(field) { field.DROPDOWN_OPTIONS.map(function(opt, i) {

                // get the arguments for the command represented by opt
                var args = field.DROPDOWN_SUB_FIELDS[i].map(function (arg) {
                   return {name: arg.MSG_KEY, type: arg.INPUT};
                });

                // Store the list of arguments and their types for this command
                fields.set(opt[0], args);

                // add this command to this object so that it may be called
                self.$d.mp$ass_subscript(new Sk.builtin.str(opt[0]), new Sk.builtin.func(function () {

                    //TODO: optional arguments
                    //TODO: keyword arguments
                    Sk.builtin.pyCheckArgs(itemIDJS + "." + opt[0], arguments, args.length, args.length);

                    return sendQueryNative({"command": "item_contents",
                            "item": itemIDJS,
                            "contents": sequentialToDict(opt[0], arguments) });
                }));
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

            // parlay attributes
            self.tp$setattr("__setattr__", new Sk.builtin.func(function (name, data) {
                Sk.builtin.pyCheckArgs("__setattr__", arguments, 2, 2);
                Sk.builtin.pyCheckType("name", "str", Sk.builtin.checkString(name));
                //TODO: figure out the appropriate type for data and check it
                //TODO: determine whether name is a property or data stream
                //Sk.builtin.pyCheckType("data", "", data instanceof );
                return sendQueryNative({
                    'command': "item_property",
                    'operation': "set",
                    'item': itemIDJS,
                    'property': Sk.ffi.remapToJs(name),
                    'value': Sk.ffi.remapToJs(data)});
            }));

            self.tp$setattr("__getattr__", new Sk.builtin.func(function (name) {
                Sk.builtin.pyCheckArgs("__getattr__", arguments, 1, 1);
                Sk.builtin.pyCheckType("name", "str", Sk.builtin.checkString(name));
                return sendQueryNative({
                    'command': "item_property",
                    'operation': "get",
                    'item': itemIDJS,
                    'property': Sk.ffi.remapToJs(name)});
            }));



        });

    }, "ProxyItem", []);

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
            };


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