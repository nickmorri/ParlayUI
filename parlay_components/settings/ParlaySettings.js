(function () {
    "use strict";

    /**
     * @module ParlaySettings
     *
     * @description
     * ParlaySettings provides an interface to the [ParlayStore]{@link module:ParlayStore.ParlayStore} that allows other components to get, set and provide
     * default values for various user configurable settings values used throughout ParlayUI.
     */

    var module_dependencies = ["parlay.store"];

    angular
        .module("parlay.settings", module_dependencies)
        .factory("ParlaySettings", ParlaySettingsFactory);

    ParlaySettingsFactory.$inject = ["ParlayStore"];
    function ParlaySettingsFactory (ParlayStore) {

        /**
         * Reference to namespace settings ParlayStore.
         * @member module:ParlayStore.ParlayStore#store
         * @private
         */
        var store = ParlayStore("settings");

        /**
         * Parlay service which manages access and modification of user configurable settings.
         * @constructor module:ParlaySettings.ParlaySettings
         *
         * @example <caption>Register default settings that can be used to restore to a default state.</caption>
         *
         * ParlaySettings.registerDefault("graph", {label_size: 12});
         *
         * @example <caption>Restore to the default setting registered with ParlaySettings.</caption>
         *
         * ParlaySettings.restoreDefault("graph");
         *
         * @example <caption>Retrieve the user set value for the given key.</caption>
         *
         * ParlaySettings.get("graph")
         *
         * @example <caption>Stores the value for the given key.</caption>
         *
         * ParlaySettings.set("graph", {label_size: newValue});
		 *
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