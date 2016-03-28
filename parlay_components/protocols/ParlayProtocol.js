function ParlayProtocolRun(ParlaySettings) {
    ParlaySettings.registerDefault("log", {max_size: 10000});

    if (!ParlaySettings.has("log")) {
        ParlaySettings.restoreDefault("log");
    }
}

function ParlayProtocolFactory(ParlaySocket, ParlayItem, ParlaySettings, $q) {

    function ParlayProtocol(configuration) {
        "use strict";
        this.id = "UI";
        this.protocol_name = configuration.name;
        this.type = configuration.protocol_type;
        this.available_items = [];
        this.log = [];

        this.listeners = {};
        
        // Objects that inherit from this ParlayProtocol's prototype can set their own item_factory.
        this.item_factory = ParlayItem;
    }
    
    /**
	 * Returns name of protocol.
	 * @returns {String} protocol name
	 */
    ParlayProtocol.prototype.getName = function () {
        return this.protocol_name;
    };
    
    /**
	 * Returns type of protocol.
	 * @returns {String} protocol type
	 */
    ParlayProtocol.prototype.getType = function () {
        return this.type;
    };
    
    /**
	 * Returns available items in protocol.
	 * @returns {Array} available items
	 */
    ParlayProtocol.prototype.getAvailableItems = function () {
        return this.available_items;
    };
    
    /**
	 * Returns all messages that have been collected by the protocol.
	 * @returns {Array} - messages collected by protocol.
	 */
    ParlayProtocol.prototype.getLog = function () {
        return this.log;
    };
    
    /**
	 * Records a listener's deregistration function with the protocol. 
	 * We want to record this function so that when the protocol is closed can clear all onMessage listeners that are relevant to this protocol.
	 * @param {Object} topics - Map of key/value pairs.
	 * @param {Function} deregistrationFn - Function returned from ParlaySocket that will cancel the onMessage callback.
	 */
    ParlayProtocol.prototype.registerListener = function (topics, deregistrationFn) {
	    var topics_string = JSON.stringify(topics);
	    
	    this.listeners[topics_string] = deregistrationFn;
	    
	    return function() {
		    if (this.listeners[topics_string]) {
				this.listeners[topics_string]();
				delete this.listeners[topics_string];
		    }		  	
	    }.bind(this);
    };
    
    /**
	 * @param {Object} response_topics - Map of key/value pairs.
	 * @param {Function} callback - Callback to invoke upon receipt of response.
	 * @param {Boolean} verbose - If true full response is given to callback, otherwise a reduced Object is returned.
	 * @returns {Function} - Listener deregistration.
	 */
    ParlayProtocol.prototype.onMessage = function(response_topics, callback, verbose) {
	    var topics = Object.keys(response_topics).reduce(function (accumulator, key) {
		   	accumulator[key] = response_topics[key];
		   	return accumulator;
	    }, {
	        TO: this.id
        });
        
        return this.registerListener(topics, ParlaySocket.onMessage(topics, callback, verbose));
    };
    
    /**
	 * Sends message through ParlaySocket.
	 * @param {Object} topics - Map of key/value pairs.
	 * @param {Object} contents - Map of key/value pairs.
	 * @param {Object} response_topics - Map of key/value pairs.
	 * @param {Boolean} verbose - If true we should invoke callback with full message. If false or undefined invoke with only contents for simplicity.
	 * @returns {$q.defer.Promise} - Resolved if ParlaySocket receives a response, rejected if an error occurs during send.
	 */
    ParlayProtocol.prototype.sendMessage = function (topics, contents, response_topics, verbose) {
        return $q(function(resolve, reject) {
	        try {
                ParlaySocket.sendMessage(topics, contents, response_topics, resolve, verbose);
            }
            catch (error) {
                reject(error);
            }
        });
    };
    
    /**
	 * Will be called on protocol open.
	 */
    ParlayProtocol.prototype.onOpen = function () {

        // Ensure that we record all messages address to the UI.
        this.onMessage({}, function (response) {
            // Upon reaching the 1.5 times the maximum specified log size we should remove 0.5
            // the maximum size elements from the beginning of the log.
            if (this.log.length >= ParlaySettings.get("log").max_size * 1.5) {
                this.log.splice(0, ParlaySettings.get("log").max_size * 0.5);
            }

	        this.log.push(response);
        }.bind(this), true);

    };
    
    /**
	 * Will be called on protocol close.
	 */
    ParlayProtocol.prototype.onClose = function () {
	    for (var listener in this.listeners) {
            if (this.listeners.hasOwnProperty(listener)) {
                this.listeners[listener]();
            }
	    }
	    
	    this.listeners = {};
	    
        this.available_items = [];
    };
    
    /**
	 * Distributes discovery message to all relevant methods.
	 * @param {Object} info - Discovery message
	 */
    ParlayProtocol.prototype.addDiscoveryInfo = function (info) {
        this.available_items = Array.isArray(info.CHILDREN)? info.CHILDREN.map(function (item) {
            return new this.item_factory(item, this);
        }, this) : [];
    };
    
    return ParlayProtocol;
}

angular.module("parlay.protocols.protocol", ["parlay.socket", "parlay.items.item", "promenade.protocols.directmessage", "parlay.settings"])
    .run(["ParlaySettings", ParlayProtocolRun])
	.factory("ParlayProtocol", ["ParlaySocket", "ParlayItem", "ParlaySettings", "$q", ParlayProtocolFactory]);