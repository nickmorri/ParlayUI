function ParlaySettingsFactory(ParlayStore) {
    "use strict";

    var store = ParlayStore("settings");

    function ParlaySettings () {
        this.defaults = {};
    }

    ParlaySettings.prototype.get = function (key) {
        return store.get(key);
    };

    ParlaySettings.prototype.set = function (key, value) {
        store.set(key, value);
    };

    ParlaySettings.prototype.has = function (key) {
        return store.has(key);
    };

    ParlaySettings.prototype.registerDefault = function (key, value) {
        this.defaults[key] = value;
    };

    ParlaySettings.prototype.restoreDefault = function (key) {
        store.set(key, this.defaults[key]);
    };

    return new ParlaySettings();

}

angular.module("parlay.settings", ["parlay.store"])
    .factory("ParlaySettings", ["ParlayStore", ParlaySettingsFactory]);