var parlay_protocol = angular.module('parlay.protocols.protocol', ['parlay.socket', 'parlay.endpoints.endpoint', 'promenade.protocols.directmessage']);

parlay_protocol.factory('ParlayProtocol', ['ParlaySocket', 'ParlayEndpoint', '$q', function (ParlaySocket, ParlayEndpoint, $q) {
    
    function ParlayProtocol(configuration) {
        "use strict";
        this.id = "UI";
        this.protocol_name = configuration.name;
        this.type = configuration.protocol_type;
        this.available_endpoints = [];
        this.active_endpoints = [];
        this.log = [];
        this.fields = {};
        
        this.listeners = {};
        
        // Objects that inherit from this ParlayProtocol's prototype can set their own endpoint_factory.
        this.endpoint_factory = ParlayEndpoint;
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
	 * Returns available endpoints in protocol.
	 * @returns {Array} available endpoints
	 */
    ParlayProtocol.prototype.getAvailableEndpoints = function () {
        return this.available_endpoints;
    };
    
    /**
	 * Returns all messages that have been collected by the protocol.
	 * @returns {Array} message log
	 */
    ParlayProtocol.prototype.getLog = function () {
        return this.log;
    };
          
    ParlayProtocol.prototype.onMessage = function(response_topics, callback, verbose) {
	    var topics = Object.keys(response_topics).reduce(function (accumulator, key) {
		   	accumulator[key] = response_topics[key];
		   	return accumulator;
	    }, {
	        TO: this.id
        });
	    
	    var topics_string = JSON.stringify(topics);
	    
	    this.listeners[topics_string] = ParlaySocket.onMessage(topics, callback, verbose);
	    
	    return function() {
		  	this.listeners[topics_string]();
		  	delete this.listeners[topics_string];  
	    }.bind(this);
    };
    
    ParlayProtocol.prototype.sendMessage = function (topics, contents, response_topics) {
        return $q(function(resolve) {
            ParlaySocket.sendMessage(topics, contents, response_topics, resolve);
        }.bind(this));
    };
    
    ParlayProtocol.prototype.onOpen = function () {
        // Ensure that we record all messages address to the UI.
        this.onMessage({}, function (response) {
	        this.log.push(response);
        }.bind(this), true);
    };
    
    ParlayProtocol.prototype.onClose = function () {
	    for (var listener in this.listeners) {
		    this.listeners[listener]();
	    }
	    
	    this.listeners = {};
	    
        this.available_endpoints = [];
        this.active_endpoints = [];
    };
    
    ParlayProtocol.prototype.buildFieldMethods = function (keys) {
        keys.forEach(function (key) {
            /* istanbul ignore else  */
            if (!this[key]) {
                Object.defineProperty(Object.getPrototypeOf(this), key, {
                    get: function() {
                        return this.fields[key];
                    }
                });    
            }            
        }, this);
    };
    
    ParlayProtocol.prototype.buildFields = function (info) {
        this.fields = Object.keys(info).filter(function (key) {
            // We should do some sort of filtering here.
            return true;
        }, this).reduce(function (accumulator, key) {
            accumulator[key] = info[key];
            return accumulator;
        }, {});
    };
    
    ParlayProtocol.prototype.getDynamicFieldKeys = function () {
        return Object.keys(this.fields);
    };
    
    ParlayProtocol.prototype.addEndpoints = function (endpoints) {
        this.available_endpoints = endpoints.map(function (endpoint) {
            return new this.endpoint_factory(endpoint, this);
        }, this);
    };
    
    ParlayProtocol.prototype.addDiscoveryInfo = function (info) {
        this.buildFields(info);
        this.buildFieldMethods(Object.keys(info));
        this.addEndpoints(info.CHILDREN);
    };
    
    return ParlayProtocol;
}]);