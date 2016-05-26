(function () {
    "use strict";

    /**
     * @module ParlaySettings
     */

    var module_dependencies = ["parlay.store"];

    angular
        .module("parlay.settings", module_dependencies)
        .factory("ParlaySettings", ParlaySettingsFactory);

    ParlaySettingsFactory.$inject = ["ParlayStore"];
    function ParlaySettingsFactory (ParlayStore) {

        // Reference to namespace settings ParlayStore.
        var store = ParlayStore("settings");

        /**
         * Parlay service which manages access and modification of user configurable settings.
         * @constructor module:ParlaySettings.ParlaySettings
         */
        function ParlaySettings () {

            /**
             * Stores default values for settings.
             * @member module:ParlaySettings.ParlaySettings#defaults
             * @public
             * @type {Object}
             */
            this.defaults = {};
        }

        /**
         * Retrieves stored setting value from ParlayStore for given key.
         * @member module:ParlaySettings.ParlaySettings#get
         * @public
         * @param {String} key - Name of setting.
         * @returns {*} - Stored setting value.
         */
        ParlaySettings.prototype.get = function (key) {
            return store.get(key);
        };

        /**
         * Stores given setting key/value in ParlayStore.
         * @member module:ParlaySettings.ParlaySettings#set
         * @public
         * @param {String} key - Name of setting.
         * @param value - Value to be stored.
         */
        ParlaySettings.prototype.set = function (key, value) {
            var settings = this.get(key);

            Object.keys(value).forEach(function (key) {
                settings[key] = value[key];
            });

            store.set(key, settings);
        };

        /**
         * Checks if given key exists in ParlayStore.
         * @member module:ParlaySettings.ParlaySettings#has
         * @public
         * @param {String} key - Name of setting.
         * @returns {Boolean} - True if key exists, false otherwise.
         */
        ParlaySettings.prototype.has = function (key) {
            return store.has(key);
        };

        /**
         * Stores the default values for the given key.
         * @member module:ParlaySettings.ParlaySettings#registerDefault
         * @public
         * @param {String} key - Name of setting.
         * @param value - Default values associated with the given key.
         */
        ParlaySettings.prototype.registerDefault = function (key, value) {
            this.defaults[key] = value;
        };

        /**
         * Restores the value of the given key to the default values if they were registered.
         * @member module:ParlaySettings.ParlaySettings#restoreDefault
         * @public
         * @param {String} key - Name of setting.
         */
        ParlaySettings.prototype.restoreDefault = function (key) {
            store.set(key, this.defaults[key]);
        };

        return new ParlaySettings();
    }

}());