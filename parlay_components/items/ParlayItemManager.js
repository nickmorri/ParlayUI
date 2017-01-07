(function () {
    "use strict";

    var module_dependencies = ["parlay.protocols.manager", "promenade.broker", "parlay.store", "parlay.item.persistence",
        "ngMaterial", "parlay.items.search", "ngMaterial"];

    angular
        .module("parlay.items.manager", module_dependencies)
        .factory("ParlayItemManager", ParlayItemManagerFactory);

    ParlayItemManagerFactory.$inject = ["PromenadeBroker", "ParlayProtocolManager", "ParlayItemPersistence", "$mdDialog"];
    function ParlayItemManagerFactory(PromenadeBroker, ParlayProtocolManager, ParlayItemPersistence, $mdDialog) {

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
            var items = this.getAvailableItems();
            for (var i = 0; i < items.length; ++i) {
                if (items[i].id === id)
                    return items[i];
            }
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

        /**
         * Activates item in workspace by creating a container Object that has a reference to the
         * [ParlayItem]{@link module:ParlayItem.ParlayItem}, a unique ID and any previously stored values.
         * @member module:ParlayItem.ParlayItemManager#activateItem
         * @public
         * @param {ParlayItem} item - Reference to the item object we want to activate.
         * @param {Number} [uid] - If given a uid we will use the provided one. Otherwise randomly generate one.
         * @param {Object} stored_values - Values that may have been stored from a origin card or previous session.
         * @param {Number} [index] - Position in active_items Array.
         */
        ParlayItemManager.prototype.activateItem = function (item, uid, stored_values, index) {

            // If a uid is not provided search for an unused one.
            if (!uid) {
                var used_ids = active_items.map(function (container) {
                    return container.uid;
                });

                uid = 0;

                while (used_ids.indexOf(uid) !== -1) {
                    uid++;
                }
            }

            var container = {
                ref: item,
                uid: uid,
                stored_values: stored_values
            };

            if (!!index) {
                // Update the $index in the active items container.
                container.stored_values.$index = index;

                active_items.splice(index, 0, container);
            } else {
                active_items.push(container);
            }
        };



        ParlayItemManager.prototype.openItemsDialog = function() {
            $mdDialog.show({
                templateUrl: "../parlay_components/items/directives/parlay-item-library-dialog.html",
                controller: "ParlayItemSearchController",
                controllerAs: "ctrl",
                clickOutsideToClose: true
            });
        };

        return new ParlayItemManager();
    }

}());