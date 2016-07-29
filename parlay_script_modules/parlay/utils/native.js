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
        Sk.builtin.pyCheckType("data['command']", "string",
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
                Sk.builtin.pyCheckType("desc['NAME']", "string", Sk.builtin.checkString(itemName));

                var itemID = desc.mp$subscript(new Sk.builtin.str("ID"));
                Sk.builtin.pyCheckType("desc['ID']", "string", Sk.builtin.checkString(itemID));

                // convert the content fields to JS for ease-of-access
                var fields = Sk.ffi.remapToJs(contentFields);
                // for each content field, dynamically create a function to access that field
                for (var i = 0; i < fields.length; i++) {
                    //TODO: how to handle arguments? (pass array?)
                    var field = fields[i].DEFAULT;
                    //TODO: can I use regular dot notation?
                    self.$d.mp$ass_subscript(new Sk.builtin.str(field), new Sk.builtin.func(function () {
                        return sendQueryNative({"command" : "item_contents",
                            "contents" : {'COMMAND' : field}},
                            function (data) {
                                return Sk.ffi.remapToPy(data.CONTENTS.RESULT);
                            });
                    }));
                }

                //TODO: necessary?
                self.itemName = itemName;
                self.itemID = itemID;

            });
        }
    }, "ProxyItem", []);

    return mod;
}