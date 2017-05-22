(function () {
    "use strict";

    var module_dependencies = ["parlay.protocols.manager", "promenade.broker", "parlay.store", "parlay.item.persistence",
        "ngMaterial", "parlay.items.search", "ngMaterial"];

    angular
        .module("parlay.items.manager", module_dependencies)
        .factory("ParlayItemManager", ParlayItemManagerFactory);

    ParlayItemManagerFactory.$inject = ["PromenadeBroker", "ParlayProtocolManager"];
    function ParlayItemManagerFactory(PromenadeBroker, ParlayProtocolManager) {

        /**
         * Holds container Objects for items currently active in workspace.
         * Each container Object holds the following attributes:
         *
         * {
         *      ref: // Reference to ParlayItem Object
         *      uid: // Unique ID needed for ng-repeat track by to uniquely identify each container.
         *      stored_values: // Values from an origin container that was duplicated or from a previous session's
         *      container.
         * }
         *
         * @member module:ParlayItem.ParlayItemManager#countActive
         * @private
         * @type {Array}


        /**
         * Manages [ParlayItem]{@link module:ParlayItem.ParlayItem}s active in the workspace.
         * Interacts with [ParlayProtocolManager]{@link module:ParlayProtocol.ParlayProtocolManager} to
         * retrieve available [ParlayItem]{@link module:ParlayItem.ParlayItem}s.
         * Also interacts with [ParlayStore]{@link module:ParlayStore.ParlayStore} to retrieve any previous workspace
         * sessions.
         * @constructor module:ParlayItem.ParlayItemManager
         */
        function ParlayItemManager () {
        }

        /**
         * Returns the available items from all connected protocols.
         * @member module:ParlayItem.ParlayItemManager#getAvailableItems
         * @public
         * @returns {Array} - Items available on all protocols.
         */
        ParlayItemManager.prototype.getAvailableItems = function () {
            var protocol_items = ParlayProtocolManager.getOpenProtocols().reduce(function (previous, current) {
                return previous.concat(current.getAvailableItems());
            }, []);
            //add the broker's protocol-less items
            PromenadeBroker.items.forEach(function(v){ protocol_items.push(v);});
            return protocol_items;
        };

        /**
         * Returns a ParlayItem searched by their unique ID
         * @param name {String} - name of the ParlayItem
         */
        ParlayItemManager.prototype.getItemByID = function (id) {
            function search(items, id) {
                for (var i = 0; i < items.length; ++i) {
                    if (items[i].id === id)
                        return items[i];
                    if (!!items[i].children) {
                        var result = search(items[i].children, id);
                        if (!!result) return result;
                    }
                }
            }

            var items = this.getAvailableItems();
            return search(items, id);
        };

        /**
         * Check whether any discovery request has been made.
         * @member module:ParlayItem.ParlayItemManager#hasDiscovered
         * @public
         * @returns {Boolean} - True if we have successfully completed a discovery, false otherwise.
         */
        ParlayItemManager.prototype.hasDiscovered = function () {
            return PromenadeBroker.getLastDiscovery() !== undefined;
        };

        /** Passes discovery request along to PromenadeBroker.
         * @member module:ParlayItem.ParlayItemManager#requestDiscovery
         * @public
         * @returns {Promise} - Resolved when a response is received.
         */
        ParlayItemManager.prototype.requestDiscovery = function () {
            return PromenadeBroker.requestDiscovery();
        };


        return new ParlayItemManager();
    }

}());