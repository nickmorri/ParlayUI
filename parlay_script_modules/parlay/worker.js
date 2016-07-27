"use strict";

function parlay_worker() {
    var mod = {};

    // sends a one-way message to the main page
    mod.sendMessage = function(data) {
        Sk.builtin.pyCheckArgs("sendMessage", arguments, 1, 1);
        self.postMessage({messageType: "pyMessage", value: Sk.ffi.remapToJs(data)});
        return Sk.builtin.null.null$;
    }

    // queries the main page for some information and waits for the response
    mod.sendQuery = function(data) {
        Sk.builtin.pyCheckArgs("sendMessage", arguments, 1, 1);
        Sk.builtin.pyCheckType("data", "dict", data instanceof Sk.builtin.dict);
        Sk.builtin.pyCheckType("data['command']", "string",
            Sk.builtin.checkString(data.mp$lookup(new Sk.builtin.str("command"))));

        self.postMessage({messageType: "pyMessage", value: Sk.ffi.remapToJs(data)});

        var result;
        var susp = new Sk.misceval.Suspension();

        // return the result of the query on resumption
        // the suspension should never resume before result is set, so throw an error if it does
        susp.resume = function() {
            if (!!result) {
                return result;
            } else {
                throw new Error("Internal Error: sendQuery suspension resumed before result was retrieved!");
            }
        }

        // attach the resolution of the program to receiveResponse
        susp.data = {type: "Sk.promise", promise: new Promise(function(resolve) {
            self.onResponse = function (data) {
                // stores the result of the query so that it will be returned by resume()
                result = Sk.ffi.remapToPy(data);
                resolve();
            }
        })};
        return susp;
    }

    return mod;

}