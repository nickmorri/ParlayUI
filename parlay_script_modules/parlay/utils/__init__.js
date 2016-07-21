"use strict";

registerModule("parlay.utils", ["parlay"], parlay_utils);
function parlay_utils(name) {
    var mod = {};

    mod.get_item_by_name = new Sk.builtin.func(function(item_name) {
        Sk.builtin.pyCheckArgs("get_item_by_name", arguments, 1, 1);
        Sk.builtin.pyCheckType("item_name", "string", Sk.builtin.checkString(item_name));
        //TODO: get item from server
        var obj = new Sk.builtin.object();
        obj.GenericSetAttr("test", "Hi!");
        return obj;
    });

    return mod;
}