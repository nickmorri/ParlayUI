function PromenadeStandardItemFactory(ParlayItem, PromenadeStandardDatastream, PromenadeStandardProperty, PromenadeStandardCommand) {
    
    /**
	 * PromenadeStandardItem constructor.
	 * Prototypically inherits from ParlayItem.
	 * @constructor
	 */
    function PromenadeStandardItem(data, protocol) {
	    // Call our parent constructor first.
        ParlayItem.call(this, data, protocol);
        
        this.type = "StandardItem";
        this.id = data.ID;
        
	    Object.defineProperty(this, 'data_types', {
	        get: function () {
                return protocol.data_types;
            }
	    });
	    
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

        if (data.CONTENT_FIELDS) {
			this.content_fields = data.CONTENT_FIELDS.reduce(function (accumulator, current) {
                accumulator[current.LABEL] = new PromenadeStandardCommand(current, this.id, protocol);
				return accumulator;
			}, {});
        }

        if (data.PROPERTIES) {
	        this.properties = data.PROPERTIES.reduce(function (accumulator, current) {
                accumulator[current.NAME] = new PromenadeStandardProperty(current, this.id, protocol);
		        return accumulator;
	        }.bind(this), {});
        }

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
	 * @param {String} query - User inputted query.
	 * @returns {Boolean} - True if match, false otherwise.
	 */
    PromenadeStandardItem.prototype.matchesId = function (query) {
        return this.id === query;
    };
    
    /**
	 * Checks if query matches type.
	 * @param {String} query - User inputted query.
	 * @returns {Boolean} - True if partial or full match, false otherwise.
	 */
    PromenadeStandardItem.prototype.matchesType = function (query) {
        return angular.lowercase(this.getType()).indexOf(query) > -1;
    };
    
    /**
	 * Checks if query matches name.
	 * @param {String} query - User inputted query.
	 * @returns {Boolean} - True if partial or full match, false otherwise.
	 */
    PromenadeStandardItem.prototype.matchesName = function (query) {
        return angular.lowercase(this.name).indexOf(query) > -1;
    };
    
    /**
	 * Checks if item has properties that match query.
	 * @param {String} query - User inputted query.
	 * @returns {Boolean} - True if partial or full match, false otherwise.
	 */
    PromenadeStandardItem.prototype.matchesQuery = function (query) {
        var lowercase_query = angular.lowercase(query);
        return this.matchesName(lowercase_query) || this.matchesType(lowercase_query) || this.matchesId(lowercase_query);
    };
    
    /**
	 * Returns message ID from the item's protocol.
	 * @returns {Number} - current message ID.
	 */
    PromenadeStandardItem.prototype.getMessageId = function () {
        return this.protocol.getMessageId();
    };
    
    /**
	 * Generates topics object for the item.
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
	 * @param {Object} contents - Map of key/value pairs.
	 * @returns {$q.defer.Promise} - Resolved when message response received.
	 */
    PromenadeStandardItem.prototype.sendMessage = function (contents) {
        return this.protocol.sendMessage(this.generateTopics(), contents, {}, true);
    };

    return PromenadeStandardItem;
}

/* istanbul ignore next */
function PromenadeStandardItemCardToolbar() {
    return {
        scope: {
            item: "="
        },
        templateUrl: "../vendor_components/promenade/items/directives/promenade-standard-item-card-toolbar.html"
    };
}

angular.module("promenade.items.standarditem", ["parlay.items", "promenade.items.datastream", "promenade.items.property", "promenade.items.command", "promenade.items.standarditem.commands", "promenade.items.standarditem.log", "promenade.items.standarditem.graph", "promenade.items.standarditem.property", "ngOrderObjectBy"])
	.factory("PromenadeStandardItem", ["ParlayItem", "PromenadeStandardDatastream", "PromenadeStandardProperty", "PromenadeStandardCommand", PromenadeStandardItemFactory])
	.directive("promenadeStandardItemCardToolbar", PromenadeStandardItemCardToolbar);