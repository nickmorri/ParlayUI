(function () {
	"use strict";

    var module_dependencies = ["parlay.protocols.manager", "promenade.broker", "parlay.item.persistence"];

    angular
        .module("parlay.items.manager", module_dependencies)
        .factory("ParlayItemManager", ParlayItemManagerFactory);

    ParlayItemManagerFactory.$inject = ["PromenadeBroker", "ParlayProtocolManager", "ParlayStore", "ParlayItemPersistence", "$window"];
	function ParlayItemManagerFactory(PromenadeBroker, ParlayProtocolManager, ParlayStore, ParlayItemPersistence, $window) {

		// Items currently active in the workspace.
		var active_items = [];

		/**
		 * Manages [ParlayItem]{@link module:ParlayItem.ParlayItem}s active in the workspace.
		 * @constructor module:ParlayItem.ParlayItemManager
         */
		function ParlayItemManager() {
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

            // Clear the current workspace before attempting to load another.
            this.clearActive();

            // Sort by the $index recorded from the previous session. This corresponds with the order that the cards will be loaded into the workspace.
            var containers = Object.keys(workspace.data).sort(function (a, b) {
                return workspace.data[a].$index > workspace.data[b].$index;
            }).map(function (key) {
                var split_name = key.split('.')[1].split('_');
                var uid = parseInt(split_name.splice(split_name.length - 1, 1)[0], 10);
                var item_name = split_name.join(' ');
                return {
                    name: item_name,
                    uid: uid,
                    stored_values: workspace.data[key]
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
            ParlayStore("items").remove(workspace_name);
            this.saved_workspaces = this.getWorkspaces();
        };

        /**
         * Clears all saved workspaces
         * @member module:ParlayItem.ParlayItemManager#clearSaved
         * @public
         */
        ParlayItemManager.prototype.clearSaved = function () {
            ParlayStore("items").clear();
            this.saved_workspaces = this.getWorkspaces();
        };

        /**
         * Returns the saved workspaces as a JSON string.
         * @member module:ParlayItem.ParlayItemManager#export
         * @public
         * @returns {String} - JSON string of saved workspaces.
         */
        ParlayItemManager.prototype.export = function () {
            return ParlayStore("items").export();
        };

        /**
         * Contents of file are passed to ParlayStore once loaded.
         * @member module:ParlayItem.ParlayItemManager#import
         * @public
         * @param {String} contents - JSON string of saved workspaces.
         */
        ParlayItemManager.prototype.import = function (contents) {
            ParlayStore("items").import(contents);
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
			return ParlayProtocolManager.getOpenProtocols().reduce(function (previous, current) {
				return previous.concat(current.getAvailableItems());
			}, []);
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
		 * Activates item.
         * @member module:ParlayItem.ParlayItemManager#activateItem
         * @public
		 * @param {ParlayItem} item - Reference to the item object we want to activate.
		 * @param {Number} uid[optional] - If given a uid we will use the provided one. Otherwise randomly generate one.
		 * @param {Object} stored_values - Values that may have been stored from a origin card or previous session.
		 * @param {Number} index - Position in active_items Array.
		 */
		ParlayItemManager.prototype.activateItem = function (item, uid, stored_values, index) {

			var container = {
				ref: item,
				uid: uid !== undefined ? uid : Math.floor(Math.random() * 1500),
				stored_values: stored_values
			};

			if (index !== undefined) {
				// Ensure the $index matches the items index in the active items container.
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
			var container = active_items[index];
			var new_uid = container.uid + Math.floor(Math.random() * 1500);

			var old_directive = 'parlayItemCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;

			this.activateItem(container.ref, new_uid, ParlayItemPersistence.collectDirective(old_directive), index + 1);
		};

		/**
		 * Deactivates an endoint that is currently active.
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
            var workspaces = ParlayStore("items").values();
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