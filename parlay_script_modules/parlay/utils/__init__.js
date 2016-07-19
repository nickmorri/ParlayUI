"use strict";

registerModule("/parlay/utils/__init__.js", parlay_utils);
function parlay_utils(name) {
    var mod = {};

    mod.get_item_by_name = new Sk.builtin.func(function(item_name) {
        Sk.builtin.pyCheckArgs("get_item_by_name", arguments, 1, 1);
        Sk.builtin.pyCheckType("item_name", "string", Sk.builtin.checkString(item_name));
        //TODO: get item from server
        return Sk.ffi.remapToPy({test : "Hi!"});
    });

    return mod;
};