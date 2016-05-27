(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "ngMessages", "ngMdIcons", "templates-main", "parlay.item.persistence", "parlay.utility", "parlay.items.item.card"];

    angular
        .module("parlay.items.item", module_dependencies)
        .factory("ParlayItem", ParlayItemFactory);

    function ParlayItemFactory() {

        function ParlayItem(data, protocol) {

            Object.defineProperty(this, "name", {
                value: data.NAME,
                enumerable: true,
                writeable: false,
                configurable: false
            });

            Object.defineProperty(this, "protocol", {
                value: protocol,
                writeable: false,
                enumerable: false,
                configurable: false
            });

            this.type = "ParlayItem";

            this.interfaces = data.INTERFACES;

            this.directives = {
                toolbar: {
                    default: [],
                    available: []
                },
                tabs: {
                    default: [],
                    available: []
                }
            };
            
            this.available_directive_cache = {};

        }

        /**
         * Gets item type.
         * @returns {String} - Item type
         */
        ParlayItem.prototype.getType = function () {
            return this.type;
        };

        /**
         * Adds the given directives as defaults for the specified target.
         * @param {String} target - Directive target: toolbar or tabs.
         * @param {Array} directives - Array of directive names.
         */
        ParlayItem.prototype.addDefaultDirectives = function(target, directives) {
            this.directives[target].default = this.directives[target].default.concat(directives);
        };

        /**
         * Adds the given directives as available for the specified target.
         * @param {String} target - Directive target: toolbar or tabs.
         * @param {Array} directives - Array of directive names.
         */
        ParlayItem.prototype.addAvailableDirectives = function (target, directives) {
            this.directives[target].available = this.directives[target].available.concat(directives);
        };

        /**
         * Gets the directives that have been added as defaults.
         * @returns {Object} - Mapping of target -> Array of default directive names.
         */
        ParlayItem.prototype.getDefaultDirectives = function () {
            var item = this;
            return Object.keys(item.directives).reduce(function (accumulator, target) {
                if (item.directives[target].hasOwnProperty("default")) {
                    accumulator[target] = item.directives[target].default;
                }
                return accumulator;
            }, {});
        };

        /**
         * Gets the directives that have been added as available.
         * @returns {Object} - Mapping of target -> Array of available directive names.
         */
        ParlayItem.prototype.getAvailableDirectives = function () {
            var item = this;
            this.available_directive_cache = Object.keys(this.directives).filter(function (target) {
                return target.indexOf("cache") === -1;
            }).reduce(function (accumulator, target) {
                accumulator[target] = item.directives[target].available;
                return accumulator;
            }, {});
            return this.directives.available_cache;
            return this.available_directive_cache;
        };

        /**
         * Abstract method that should be overwritten by those that prototypically inherit from ParlayItem.
         */
        ParlayItem.prototype.matchesQuery = function () {
            console.warn("matchesQuery is not implemented for " + this.name);
        };

        return ParlayItem;

    }

}());