(function () {
	"use strict";

    var module_dependencies = ["parlay.protocols.manager", "promenade.broker", "parlay.store", "parlay.item.persistence"];

    angular
        .module("parlay.items.manager", module_dependencies)
        .factory("ParlayItemManager", ParlayItemManagerFactory);

    ParlayItemManagerFactory.$inject = ["PromenadeBroker", "ParlayProtocolManager", "ParlayStore", "ParlayItemPersistence", "$window"];
	function ParlayItemManagerFactory(PromenadeBroker, ParlayProtocolManager, ParlayStore, ParlayItemPersistence, $window) {

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
         */
        var active_items = [];

        /**
         * Reference to the items namespace [ParlayStore]{@link module:ParlayStore.ParlayStore} instance.
         * @member module:ParlayItem.ParlayItemManager#store
         * @private
         * @type {ParlayStore}
         */
        var store = ParlayStore("items");

		/**
		 * Manages [ParlayItem]{@link module:ParlayItem.ParlayItem}s active in the workspace.
         * Interacts with [ParlayProtocolManager]{@link module:ParlayProtocol.ParlayProtocolManager} to
         * retrieve available [ParlayItem]{@link module:ParlayItem.ParlayItem}s.
         * Also interacts with [ParlayStore]{@link module:ParlayStore.ParlayStore} to retrieve any previous workspace
         * sessions.
		 * @constructor module:ParlayItem.ParlayItemManager
         */
		function ParlayItemManager () {
            this.saved_workspaces = this.getWorkspaces();
			// Add event handler before window unload to auto save items.
			$window.addEventListener("beforeunload", ParlayItemManager.prototype.autoSave.bind(this));
		}

        /**
         * Returns the number of items currently active.
         * @member module:ParlayItem.ParlayItemManager#countActive
         * @public
         * @returns {Number} item count
         */
        ParlayItemManager.prototype.countActive = function () {
            return this.getActiveItems().length;
        };

        /**
         * Clears reference to active item object.
         * @member module:ParlayItem.ParlayItemManager#clearActive
         * @public
         */
        ParlayItemManager.prototype.clearActive = function () {
            active_items = [];
        };

        /**
         * Returns all saved workspaces except for those that were autosaved.
         * @member module:ParlayItem.ParlayItemManager#getSaved
         * @public
         * @returns {Array} - Array of workspace objects.
         */
        ParlayItemManager.prototype.getSaved = function () {
            return this.saved_workspaces.filter(function (workspace) {
                return !workspace.autosave;
            });
        };

        /**
         * Returns auto saved workspace Object.
         * @member module:ParlayItem.ParlayItemManager#getAutosave
         * @public
         * @returns {Object}
         */
        ParlayItemManager.prototype.getAutosave = function () {
            return this.saved_workspaces.find(function (workspace) {
                return workspace.autosave;
            });
        };

        /**
         * Saves the items active in the workspace to a workspace with the given name.
         * @member module:ParlayItem.ParlayItemManager#saveEntry
         * @public
         * @param {Object} workspace - Workspace container Object.
         */
        ParlayItemManager.prototype.saveEntry = function (workspace) {
            ParlayItemPersistence.store(workspace.name);
            this.saved_workspaces = this.getWorkspaces();
        };

        /**
         * Loads items from the specified workspace.
         * @member module:ParlayItem.ParlayItemManager#loadEntry
         * @public
         * @param {Object} workspace - Saved workspace to be loaded.
         */
        ParlayItemManager.prototype.loadEntry = function (workspace) {

            // Make copy to ensure that the references are broker from the saved workspaces.
            var copy = angular.copy(workspace);

            // Collect the used UIDs so that ng-repeat won't assume items are the same.
            var used_uids = active_items.map(function (item) {
                return item.uid;
            });

            // Clear the current workspace before attempting to load another.
            this.clearActive();

            // Sort by the $index recorded from the previous session. This corresponds with the order that the cards will be loaded into the workspace.
            var containers = Object.keys(copy.data).sort(function (a, b) {
                return copy.data[a].$index > copy.data[b].$index;
            }).map(function (key) {
                var split_name = key.split('.')[1].split('_');
                var uid = parseInt(split_name.splice(split_name.length - 1, 1)[0], 10);

                while (used_uids.indexOf(uid) > -1) {
                    uid++;
                }
                used_uids.push(uid);

                var item_name = split_name.join(' ');
                return {
                    name: item_name,
                    uid: uid,
                    stored_values: copy.data[key]
                };
            });

            var loaded_items = [];
            var failed_items = [];

            // Add each saved card to the workspace if their exists a valid available item.
            containers.forEach(function (container) {
                var item = this.getAvailableItems().find(function (item) {
                    return container.name === item.name;
                });
                if (item !== undefined) {
                    loaded_items.push(container);
                    this.activateItem(item, container.uid, container.stored_values);
                }
                else {
                    failed_items.push(container);
                }
            }, this);

            return {
                loaded_items: loaded_items,
                failed_items: failed_items
            };

        };

        /**
         * Deletes the given saved workspace.
         * @member module:ParlayItem.ParlayItemManager#deleteEntry
         * @public
         * @param {String} workspace_name - Workspace name.
         */
        ParlayItemManager.prototype.deleteEntry = function (workspace_name) {
            store.remove(workspace_name);
            this.saved_workspaces = this.getWorkspaces();
        };

        /**
         * Clears all saved workspaces
         * @member module:ParlayItem.ParlayItemManager#clearSaved
         * @public
         */
        ParlayItemManager.prototype.clearSaved = function () {
            store.clear();
            this.saved_workspaces = this.getWorkspaces();
        };

        /**
         * Returns the saved workspaces as a JSON string.
         * @member module:ParlayItem.ParlayItemManager#export
         * @public
         * @returns {Object} - Object containing saved workspaces.
         */
        ParlayItemManager.prototype.export = function () {
            return store.export();
        };

        /**
         * Contents of file are passed to ParlayStore once loaded.
         * @member module:ParlayItem.ParlayItemManager#import
         * @public
         * @param {String} contents - JSON string of saved workspaces.
         */
        ParlayItemManager.prototype.import = function (contents) {
            store.import(contents);
            this.saved_workspaces = this.getWorkspaces();
        };

		/**
		 * Returns Object of active item containers.
         * @member module:ParlayItem.ParlayItemManager#getActiveItems
         * @public
		 * @returns {Object} key: order, value: active item containers
		 */
		ParlayItemManager.prototype.getActiveItems = function () {
			return active_items;
		};

		/**
		 * Checks if we currently have active items.
         * @member module:ParlayItem.ParlayItemManager#hasActiveItems
         * @public
		 * @returns {Boolean} true if we have items, false otherwise.
		 */
		ParlayItemManager.prototype.hasActiveItems = function () {
			return this.countActive() > 0;
		};

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
		 * Swaps the item at the specified index with the item at index + distance.
         * @member module:ParlayItem.ParlayItemManager#reorder
         * @public
		 * @param {Number} index - position of item to swap.
		 * @param {Number} distance - How far to move target item.
		 */
		ParlayItemManager.prototype.reorder = function (index, distance) {
			var temp = active_items[index + distance];
			active_items[index + distance] = active_items[index];
			active_items[index] = temp;
		};

        /**
         * Swaps the items at the given indices.
         * @member module:ParlayItem.ParlayItemManager#swap
         * @public
         * @param {Number} indexA - Index of item A.
         * @param {Number} indexB - Index of item B.
         */
		ParlayItemManager.prototype.swap = function (indexA, indexB) {
			var temp = active_items[parseInt(indexA, 10)];
			active_items[parseInt(indexA, 10)] = active_items[parseInt(indexB, 10)];
			active_items[parseInt(indexB, 10)] = temp;
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
			}
			else {
				active_items.push(container);
			}
		};

		/**
		 * Creates a duplicate item container that references the same item available at the given index.
         * @member module:ParlayItem.ParlayItemManager#duplicateItem
         * @public
		 * @param {Number} index - Position of the item we want to duplicate.
		 */
		ParlayItemManager.prototype.duplicateItem = function (index) {
            var used_ids = active_items.map(function (container) {
                return container.uid;
            });

            var new_uid = 0;

            while (used_ids.indexOf(new_uid) !== -1) {
                new_uid++;
            }

            var container = active_items[index];

			var old_directive = 'parlayItemCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;

			this.activateItem(container.ref, new_uid, ParlayItemPersistence.collectDirective(old_directive), index + 1);
		};

		/**
		 * Deactivates an item that is currently active.
         * @member module:ParlayItem.ParlayItemManager#deactivateItem
         * @public
		 * @param {Number} index - Position of item to be deactivated.
		 */
		ParlayItemManager.prototype.deactivateItem = function (index) {
			active_items.splice(index, 1);
		};

        /**
         * Gets all saved workspace objects.
         * @member module:ParlayItem.ParlayItemManager#getWorkspaces
         * @public
         * @returns {Array} - Array of workspace Objects.
         */
        ParlayItemManager.prototype.getWorkspaces = function () {
            var workspaces = store.values();
            return Object.keys(workspaces).map(function (key) {
                return workspaces[key];
            }).map(function (workspace) {
                workspace.timestamp = new Date(workspace.timestamp);
                workspace.count = Object.keys(workspace.data).length;
                return workspace;
            });
        };

        /**
		 * Saves active items to a workspace titled AutoSave automatically.
         * @member module:ParlayItem.ParlayItemManager#autoSave
         * @public
		 */
		ParlayItemManager.prototype.autoSave = function() {
			if (this.hasActiveItems()) {
				ParlayItemPersistence.store("AutoSave", true);
			}
		};

		return new ParlayItemManager();
	}

}());