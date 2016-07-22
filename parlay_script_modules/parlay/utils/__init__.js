"use strict";

parlay_utils.$dependencies = [];
function parlay_utils(name) {
    var mod = {};

    mod.get_item_by_name = new Sk.builtin.func(function(item_name) {
        Sk.builtin.pyCheckArgs("get_item_by_name", arguments, 1, 1);
        Sk.builtin.pyCheckType("item_name", "string", Sk.builtin.checkString(item_name));
        //TODO: get item from server
        var obj = new Sk.builtin.object();
        return obj;
    });

    // dummy setup function for ease of portability
    mod.setup = new Sk.builtin.func(function() {
        //TODO: check args? (does nothing anyway)
        //Sk.builtin.pyCheckArgs("setup", arguments, -1, -1);
        return Sk.builtin.none.none$;
    });

    // TODO: implement
    mod.discover = new Sk.builtin.func(function() {
        //TODO: check args
        //Sk.builtin.pyCheckArgs("setup", arguments, -1, -1);
        return Sk.builtin.none.none$;
    });

    return mod;
}