(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.items.card"];

    angular
        .module("parlay.items.item", module_dependencies)
        .factory("ParlayItem", ParlayItemFactory);

    function ParlayItemFactory () {

        /**
         * Model for a ParlayItem. Intended to be used as a base class that is extended by vendor's representation of
         * ParlayItem but can stand on its own as well.
         * @constructor module:ParlayItem.ParlayItem
         * @abstract
         * @param {Object} data - A ParlayItem's unique data.
         * @param {String} data.NAME - Human readable identifier.
         * @param {(Array|Object)} data.INTERFACES - Potential interfaces that the ParlayItem is compatible with.
         * @param {ParlayProtocol} protocol - Reference to the [ParlayProtocol]{@link module:ParlayProtocol.ParlayProtocol} instance that the ParlayItem is connected to.
         *
         * @example <caption>Initializing a ParlayItem with discovery data.</caption>
         *
         * // discovery: Object with the discovery data needed to build the ParlayItem.
         * // protocol: ParlayProtocol or a prototypical inheritor that the ParlayItem is connected to.
         *
         * var item = new ParlayItem(discovery, protocol);
         * 
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
                writable: false,
                configurable: false
            });

            /**
             * Reference to the [ParlayProtocol]{@link module:ParlayProtocol.ParlayProtocol} instance that the
             * ParlayItem is connected to.
             * @member module:ParlayItem.ParlayItem#protocol
             * @public
             * @type {ParlayProtocol}
             */
            Object.defineProperty(this, "protocol", {
                value: protocol,
                writable: false,
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
             * This ParlayItem's datastreams
             * @member module:ParlayItem.ParlayItem#datastreams
             * @public
             * @type {(Array|Object)}
             */
            this.datastreams = data.DATASTREAMS;

            /**
             * All the available and default directives that the ParlayItem will compile in toolbar and tabs locations.
             * @member module:ParlayItem.ParlayItem#directives
             * @public
             * @type {Object}
             */
            this.directives = {
                toolbar: [],
                tabs: []
            };
            
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
         * Adds the given directives for the specified target.
         * @member module:ParlayItem.ParlayItem#addDirectives
         * @public
         * @param {String} target - Directive target: toolbar or tabs.
         * @param {Array} directives - Array of directive names.
         */
        ParlayItem.prototype.addDirectives = function (target, directives) {
            this.directives[target] = this.directives[target].concat(directives);
        };

        /**
         * Gets the directives that have been added as available.
         * @member module:ParlayItem.ParlayItem#getDirectives
         * @public
         * @returns {Object} - Mapping of target -> Array of directive names.
         */
        ParlayItem.prototype.getDirectives = function () {
            return this.directives;
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