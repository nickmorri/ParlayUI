// Holds the module dependencies for StandardItem. Creating this Array on the Global scope allows for other modules,
// such as tabs to include themselves as StandardItem dependencies.
var standard_item_dependencies = ["parlay.items", "promenade.items.standarditem.toolbar", "promenade.items.datastream", "promenade.items.property", "promenade.items.command", "ngOrderObjectBy"];

(function (module_dependencies) {
    "use strict";

    /**
     * @module PromenadeStandardItem
     */

    angular
        .module("promenade.items.standarditem", module_dependencies)
        .factory("PromenadeStandardItem", PromenadeStandardItemFactory);

    PromenadeStandardItemFactory.$inject = ["ParlayItem", "PromenadeStandardDatastream", "PromenadeStandardProperty", "PromenadeStandardCommand"];
    function PromenadeStandardItemFactory(ParlayItem, PromenadeStandardDatastream, PromenadeStandardProperty, PromenadeStandardCommand) {

        /**
         * PromenadeStandardItem extends from [ParlayItem]{module:ParlayItem.ParlayItem} to better accommodate the discovery data provided.
         * @extends module:ParlayItem.ParlayItem
         * @constructor module:PromenadeStandardItem.PromenadeStandardItem
         * @param {Object} data - Discovery information to initialize the item with.
         * @param {Object} data.ID - Unique identifier.
         * @param {Object} protocol - Reference to the parent protocol instance.
         */
        function PromenadeStandardItem (data, protocol) {
            // Call our parent constructor first.
            ParlayItem.call(this, data, protocol);

            /**
             * Allows for more reliable identification of item that prototypically inherit from ParlayItem.
             * @member module:PromenadeStandardItem.PromenadeStandardItem#type
             * @public
             * @type {String}
             */
            this.type = "StandardItem";

            /**
             * Unique identifier.
             * @member module:PromenadeStandardItem.PromenadeStandardItem#id
             * @public
             */
            this.id = data.ID;

            /**
             * Defines as the protocol's data_types attribute.
             * @member module:PromenadeStandardItem.PromenadeStandardItem#data_types
             * @public
             */
            Object.defineProperty(this, 'data_types', {
                get: function () {
                    return protocol.data_types;
                }
            });

            /**
             * Defines as the protocol's log items that matches the id of the item.
             * @member module:PromenadeStandardItem.PromenadeStandardItem#log
             * @public
             */
            Object.defineProperty(this, 'log', {
                get: function () {
                    return protocol.getLog().filter(function (message) {
                        return message.TOPICS.FROM === this.id;
                    }, this);
                }
            });

            // Add toolbar and tabs directives.
            this.addDefaultDirectives("toolbar", ["promenadeStandardItemCardToolbar"]);
            this.addDefaultDirectives("tabs", [
                "promenadeStandardItemCardCommands",
                "promenadeStandardItemCardProperty",
                "promenadeStandardItemCardGraph",
                "promenadeStandardItemCardLog"
            ]);
            this.addAvailableDirectives("tabs", [
                "promenadeStandardItemCardCommands",
                "promenadeStandardItemCardProperty",
                "promenadeStandardItemCardGraph",
                "promenadeStandardItemCardLog"
            ]);

            // If the discovery data contains [PromenadeStandardCommand]{@link module:PromenadeStandard.PromenadeStandardCommand}s we should initialize them.
            if (data.CONTENT_FIELDS) {
                this.content_fields = data.CONTENT_FIELDS.reduce(function (accumulator, current) {
                    accumulator[current.LABEL] = new PromenadeStandardCommand(current, this.id, protocol);
                    return accumulator;
                }.bind(this), {});
            }

            // If the discovery data contains [PromenadeStandardProperty]{@link module:PromenadeStandard.PromenadeStandardProperty}s we should initialize them.
            if (data.PROPERTIES) {
                this.properties = data.PROPERTIES.reduce(function (accumulator, current) {
                    accumulator[current.NAME] = new PromenadeStandardProperty(current, this.id, protocol);
                    return accumulator;
                }.bind(this), {});
            }

            // If the discovery data contains [PromenadeStandardDatastream]{@link module:PromenadeStandard.PromenadeStandardDatastream}s we should initialize them.
            if (data.DATASTREAMS) {
                this.data_streams = data.DATASTREAMS.reduce(function (accumulator, current) {
                    accumulator[current.NAME] = new PromenadeStandardDatastream(current, this.id, protocol);
                    return accumulator;
                }.bind(this), {});
            }

        }

        // Prototypically inherit from ParlayItem.
        PromenadeStandardItem.prototype = Object.create(ParlayItem.prototype);

        /**
         * Checks if query equals id.
         * @member module:PromenadeStandardItem.PromenadeStandardItem#matchesId
         * @public
         * @param {String} query - User inputted query.
         * @returns {Boolean} - True if match, false otherwise.
         */
        PromenadeStandardItem.prototype.matchesId = function (query) {
            return this.id === query;
        };

        /**
         * Checks if query matches type.
         * @member module:PromenadeStandardItem.PromenadeStandardItem#matchesType
         * @public
         * @param {String} query - User inputted query.
         * @returns {Boolean} - True if partial or full match, false otherwise.
         */
        PromenadeStandardItem.prototype.matchesType = function (query) {
            return angular.lowercase(this.getType()).indexOf(query) > -1;
        };

        /**
         * Checks if query matches name.
         * @member module:PromenadeStandardItem.PromenadeStandardItem#matchesName
         * @public
         * @param {String} query - User inputted query.
         * @returns {Boolean} - True if partial or full match, false otherwise.
         */
        PromenadeStandardItem.prototype.matchesName = function (query) {
            return angular.lowercase(this.name).indexOf(query) > -1;
        };

        /**
         * Checks if item has properties that match query.
         * @member module:PromenadeStandardItem.PromenadeStandardItem#matchesQuery
         * @public
         * @param {String} query - User inputted query.
         * @returns {Boolean} - True if partial or full match, false otherwise.
         */
        PromenadeStandardItem.prototype.matchesQuery = function (query) {
            var lowercase_query = angular.lowercase(query);
            return this.matchesName(lowercase_query) || this.matchesType(lowercase_query) || this.matchesId(lowercase_query);
        };

        /**
         * Returns message ID from the item's protocol.
         * @member module:PromenadeStandardItem.PromenadeStandardItem#getMessageId
         * @public
         * @returns {Number} - current message ID.
         */
        PromenadeStandardItem.prototype.getMessageId = function () {
            return this.protocol.getMessageId();
        };

        /**
         * Generates topics object for the item.
         * @member module:PromenadeStandardItem.PromenadeStandardItem#generateTopics
         * @public
         * @returns {Object} - Map of key/value pairs.
         */
        PromenadeStandardItem.prototype.generateTopics = function () {
            return {
                TO: this.id,
                MSG_TYPE: "COMMAND"
            };
        };

        /**
         * Sends message using the item's protocol.
         * @member module:PromenadeStandardItem.PromenadeStandardItem#sendMessage
         * @public
         * @param {Object} contents - Map of key/value pairs.
         * @returns {$q.defer.Promise} - Resolved when message response received.
         */
        PromenadeStandardItem.prototype.sendMessage = function (contents) {
            return this.protocol.sendMessage(this.generateTopics(), contents, {}, true);
        };

        return PromenadeStandardItem;
    }

}(standard_item_dependencies));