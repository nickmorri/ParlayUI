function ParlaySettingsFactory(ParlayStore) {
    "use strict";

    // Reference to namespace settings ParlayStore.
    var store = ParlayStore("settings");

    /**
     * Parlay service which manages access and modification of user configurable settings.
     * @constructor
     */
    function ParlaySettings () {

        // Stores default values for settings.
        this.defaults = {};
    }

    /**
     * Retrieves stored setting value from ParlayStore for given key.
     * @param {String} key - Name of setting.
     * @returns {*} - Stored setting value.
     */
    ParlaySettings.prototype.get = function (key) {
        return store.get(key);
    };

    /**
     * Stores given setting key/value in ParlayStore.
     * @param {String} key - Name of setting.
     * @param value - Value to be stored.
     */
    ParlaySettings.prototype.set = function (key, value) {
        var settings = this.get(key);

        for (var item in value) {
            settings[item] = value[item];
        }

        store.set(key, settings);
    };

    /**
     * Checks if given key exists in ParlayStore.
     * @param {String} key - Name of setting.
     * @returns {Boolean} - True if key exists, false otherwise.
     */
    ParlaySettings.prototype.has = function (key) {
        return store.has(key);
    };

    /**
     * Stores the default values for the given key.
     * @param {String} key - Name of setting.
     * @param value - Default values associated with the given key.
     */
    ParlaySettings.prototype.registerDefault = function (key, value) {
        this.defaults[key] = value;
    };

    /**
     * Restores the value of the given key to the default values if they were registered.
     * @param {String} key - Name of setting.
     */
    ParlaySettings.prototype.restoreDefault = function (key) {
        store.set(key, this.defaults[key]);
    };

    return new ParlaySettings();

}

angular.module("parlay.settings", ["parlay.store"])
    .factory("ParlaySettings", ["ParlayStore", ParlaySettingsFactory]);