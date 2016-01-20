function ParlayItemManagerFactory(PromenadeBroker, ParlayProtocolManager, ParlayStore, $window) {

    // Items currently active in the workspace.
    var active_items = [];

    function ParlayItemManager() {
        // Add event handler before window unload to autosave items.
        $window.onbeforeunload = ParlayItemManager.prototype.autoSave.bind(this);
    }
    
    /**
	 * Returns Object of active item containers
	 * @returns {Object} key: order, value: active item containers
	 */
    ParlayItemManager.prototype.getActiveItems = function () {
	    return active_items;
    };
    
    /**
	 * Checks if we currently have active items.
	 * @returns {Boolean} true if we have items, false otherwise.
	 */
    ParlayItemManager.prototype.hasActiveItems = function () {
	    return this.getActiveItemCount() > 0;
    };
    
    /**
	 * Returns the number of items currently active.
	 * @returns {Number} item count
	 */
    ParlayItemManager.prototype.getActiveItemCount = function () {
	    return this.getActiveItems().length;
    };
    
    /**
	 * Clears reference to active item object.
	 */
    ParlayItemManager.prototype.clearActiveItems = function () {
	    active_items = [];
    };
    
    /**
	 * Returns the available items from all connected protocols.
	 * @returns {Array} - Items available on all protocols
	 */
    ParlayItemManager.prototype.getAvailableItems = function () {
        return ParlayProtocolManager.getOpenProtocols().reduce(function (previous, current) {
            return previous.concat(current.getAvailableItems());
        }, []);
    };
    
    /**
	 * Check whether any discovery request has been made.
	 * @returns {Boolean} - True if we have successfully completed a discovery, false otherwise.
	 */
    ParlayItemManager.prototype.hasDiscovered = function () {
	    return PromenadeBroker.getLastDiscovery() !== undefined;
    };
    
    /**
	 * Requests discovery from PromenadeBroker.
	 * @returns {$q.defer.promise} - Resolved when a response is received from the Broker.
	 */
    ParlayItemManager.prototype.requestDiscovery = function () {
        return PromenadeBroker.requestDiscovery(true);
    };
    
    /**
	 * Swaps the item at the specified index with the item at index + distance.
	 * @param {Number} index - position of item to swap.
	 * @param {Number} distance - How far to move target item.
	 */
    ParlayItemManager.prototype.reorder = function (index, distance) {
	    var temp = active_items[index + distance];
	    active_items[index + distance] = active_items[index];
	    active_items[index] = temp;
    };
    
    /**
	 * Activates item. 
	 * @param {ParlayItem} item - Reference to the item object we want to activate.
	 * @param {Number} uid[optional] - If given a uid we will use the provided one. Otherwise we will randomly generate one.
	 */
    ParlayItemManager.prototype.activateItem = function (item, uid) {
	    active_items.push({
		    ref: item,
		    uid: uid !== undefined ? uid : Math.floor(Math.random() * 1500)
	    });
    };
    
    /**
	 * Creates a duplicate item container that references the same item available at the given index.
	 * @param {Number} index - Position of the item we want to duplicate.
	 */
    ParlayItemManager.prototype.duplicateItem = function (index) {
	    var container = active_items[index];
	    var new_uid = container.uid + Math.floor(Math.random() * 1500);
	    
	    var old_directive = 'parlayItemCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;
	    var new_directive = 'parlayItemCard.' + container.ref.name.replace(' ', '_') + '_' + new_uid;
	    
		// We should remove and Angular $ or $$ variables since they are generated.
		var session_data = ParlayStore("items").getSessionItem(old_directive);
		for (var key in session_data) {
			if (key.indexOf('$') !== -1) {
				delete session_data[key];
			}
		}
	    
	    ParlayStore("items").setSessionItem(new_directive, session_data);
	    this.activateItem(container.ref, new_uid);
    };
    
    /**
	 * Deactivates an endoint that is currently active.
	 * @param {Number} index - Position of item to be deactivated.
	 */
    ParlayItemManager.prototype.deactivateItem = function (index) {
	    active_items.splice(index, 1);
    };
    
    /**
	 * Loads items from the specified workspace.
	 * @param {Workspace} workspace - Saved workspace to be loaded.
	 */
	ParlayItemManager.prototype.loadWorkspace = function (workspace) {
		
		// Sort by the $index recorded from the previous session. This corresponds with the order that the cards will be loaded into the workspace.
		var containers = Object.keys(workspace.data).sort(function (a, b) {
			return workspace.data[a].$index > workspace.data[b].$index;
		}).map(function (key) {
			var split_name = key.split('.')[1].split('_');
			var uid = parseInt(split_name.splice(split_name.length - 1, 1)[0], 10);
			var item_name = split_name.join(' ');			
			return {
				name: item_name,
				uid: uid
			};
		});
		
		var loaded_items = false;
		
		// Add each saved card to the workspace if their exists a valid available item.
		containers.forEach(function (container) {
			var item = this.getAvailableItems().find(function (item) {
				return container.name === item.name;
			});
			if (item !== undefined) {
				loaded_items = true;
				this.activateItem(item, container.uid);
			}
		}, this);
		
		return loaded_items;
		
	};

    /**
     * Saves active items to a workspace titled AutoSave automatically.
     */
	ParlayItemManager.prototype.autoSave = function() {
		if (this.hasActiveItems()) {
            ParlayStore("items").moveItemToLocal('AutoSave', true);
        }
	};

	return new ParlayItemManager();
}

angular.module('parlay.items.manager', ['parlay.protocols.manager', 'promenade.broker', 'parlay.store', 'parlay.items.workspaces'])
	.factory('ParlayItemManager', ['PromenadeBroker', 'ParlayProtocolManager', 'ParlayStore', '$window', ParlayItemManagerFactory]);