(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "ngMessages", "ngMdIcons", "templates-main", "parlay.item.persistence", "parlay.utility", "parlay.items.item.card"];

    angular
        .module("parlay.items.item", module_dependencies)
        .factory("ParlayItem", ParlayItemFactory);

    function ParlayItemFactory () {

        /**
         * Model for a ParlayItem. Intended to be used as a base class that is extended by vendor's representation of
         * ParlayItem but can stand on its own as well.
         * @constructor module:ParlayItem.ParlayItem
         * @param {Object} data - A ParlayItem's unique data.
         * @param {String} data.NAME - A unique name used to identify a ParlayItem.
         * @param {(Array|Object)} data.INTERFACES - Potential interfaces that the ParlayItem is compatible with.
         * @param {ParlayProtocol} protocol - Reference to the ParlayProtocol instance that the ParlayItem is connected to.
         */
        function ParlayItem (data, protocol) {

            /**
             * Unique name used to identify a ParlayItem.
             * @member module:ParlayItem.ParlayItem#name
             * @public
             * @type {String}
             */
            Object.defineProperty(this, "name", {
                value: data.NAME,
                enumerable: true,
                writeable: false,
                configurable: false
            });

            /**
             * Reference to the ParlayProtocol instance that the ParlayItem is connected to.
             * @member module:ParlayItem.ParlayItem#protocol
             * @public
             * @type {ParlayProtocol}
             */
            Object.defineProperty(this, "protocol", {
                value: protocol,
                writeable: false,
                enumerable: false,
                configurable: false
            });

            /**
             * Intended to be overwritten by inheritor with the name of its class.
             * @member module:ParlayItem.ParlayItem#type
             * @public
             * @type {String}
             */
            this.type = "ParlayItem";

            /**
             * All the potential interfaces that the ParlayItem is compatible with.
             * @member module:ParlayItem.ParlayItem#interfaces
             * @public
             * @type {(Array|Object)}
             */
            this.interfaces = data.INTERFACES;

            /**
             * All the available and default directives that the ParlayItem can use for toolbar and tabs locations.
             * @member module:ParlayItem.ParlayItem#directives
             * @public
             * @type {Object}
             */
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
         * @member module:ParlayItem.ParlayItem#getType
         * @public
         * @returns {String} - Item type
         */
        ParlayItem.prototype.getType = function () {
            return this.type;
        };

        /**
         * Adds the given directives as defaults for the specified target.
         * @member module:ParlayItem.ParlayItem#addDefaultDirectives
         * @public
         * @param {String} target - Directive target: toolbar or tabs.
         * @param {Array} directives - Array of directive names.
         */
        ParlayItem.prototype.addDefaultDirectives = function(target, directives) {
            this.directives[target].default = this.directives[target].default.concat(directives);
        };

        /**
         * Adds the given directives as available for the specified target.
         * @member module:ParlayItem.ParlayItem#addAvailableDirectives
         * @public
         * @param {String} target - Directive target: toolbar or tabs.
         * @param {Array} directives - Array of directive names.
         */
        ParlayItem.prototype.addAvailableDirectives = function (target, directives) {
            this.directives[target].available = this.directives[target].available.concat(directives);
        };

        /**
         * Gets the directives that have been added as defaults.
         * @member module:ParlayItem.ParlayItem#getDefaultDirectives
         * @public
         * @returns {Object} - Mapping of target -> Array of default directive names.
         */
        ParlayItem.prototype.getDefaultDirectives = function () {
            return Object.keys(this.directives).reduce(function (accumulator, target) {
                if (this.directives[target].hasOwnProperty("default")) {
                    accumulator[target] = this.directives[target].default;
                }
                return accumulator;
            }.bind(this), {});
        };

        /**
         * Gets the directives that have been added as available.
         * @member module:ParlayItem.ParlayItem#getAvailableDirectives
         * @public
         * @returns {Object} - Mapping of target -> Array of available directive names.
         */
        ParlayItem.prototype.getAvailableDirectives = function () {
            this.available_directive_cache = Object.keys(this.directives).filter(function (target) {
                return target.indexOf("cache") === -1;
            }).reduce(function (accumulator, target) {
                accumulator[target] = this.directives[target].available;
                return accumulator;
            }.bind(this), {});
            return this.available_directive_cache;
        };

        /**
         * Abstract method that should be overwritten by those that prototypically inherit from ParlayItem.
         * @abstract
         * @public
         * @member module:ParlayItem.ParlayItem#matchesQuery
         */
        ParlayItem.prototype.matchesQuery = function () {
            console.warn("matchesQuery is not implemented for " + this.name);
        };

        return ParlayItem;
    }

}());