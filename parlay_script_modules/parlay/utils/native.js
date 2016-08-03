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
        {
            $loc.__init__ = new Sk.builtin.func(function (self, desc) {
                Sk.builtin.pyCheckArgs("ProxyItem.__init__", arguments, 2, 2);
                Sk.builtin.pyCheckType("desc", "dict", desc instanceof Sk.builtin.dict);

                // we map content fields to proxy methods, so check that the description specifies them
                var contentFields = desc.mp$subscript(new Sk.builtin.str("CONTENT_FIELDS"));
                Sk.builtin.pyCheckType("desc['CONTENT_FIELDS']", "list", contentFields instanceof Sk.builtin.list);

                var itemName = desc.mp$subscript(new Sk.builtin.str("NAME"));
                Sk.builtin.pyCheckType("desc['NAME']", "str", Sk.builtin.checkString(itemName));

                var itemID = desc.mp$subscript(new Sk.builtin.str("ID"));
                Sk.builtin.pyCheckType("desc['ID']", "str", Sk.builtin.checkString(itemID));

                // convert the content fields to JS for ease-of-access
                var fields = Sk.ffi.remapToJs(contentFields);

                // convert the itemID to Js for ease-of-access
                var itemIDJS = Sk.ffi.remapToJs(itemID);

                // synchronous parlay commands
                fields.map(function(field) { field.DROPDOWN_OPTIONS.map(function(opt, i) {

                    var args = field.DROPDOWN_SUB_FIELDS[i];

                    self.$d.mp$ass_subscript(new Sk.builtin.str(opt[0]), new Sk.builtin.func(function () {

                        //TODO: optional arguments
                        //TODO: keyword arguments
                        Sk.builtin.pyCheckArgs("ProxyItem." + opt[0], arguments, args.length, args.length);

                        var contents = {'COMMAND': opt[0]};

                        // check that the arguments are of the appropriate types and put them into contents
                        Array.prototype.map.call(arguments, function(arg, i) {
                            var argDef = args[i];
                            //TODO: check all types
                            switch (argDef.INPUT) {
                                case "STRING":
                                    Sk.builtin.pyCheckType(argDef.MSG_KEY, "str", Sk.builtin.checkString(arg));
                                    break;
                                default:
                                    break;
                            }
                            contents[argDef.MSG_KEY] = Sk.ffi.remapToJs(arg);
                        });

                        return sendQueryNative({"command": "item_contents",
                                "item": itemIDJS,
                                "contents": contents },
                            function (data) {
                                return Sk.ffi.remapToPy(data.CONTENTS.RESULT);
                            });
                    }));
                })});


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
        }
    }, "ProxyItem", []);

    return mod;
}