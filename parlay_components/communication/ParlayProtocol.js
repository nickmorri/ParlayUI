var parlay_protocol = angular.module('parlay.protocols.protocol', ['parlay.socket', 'promenade.protocols.directmessage']);

parlay_protocol.factory('ParlayProtocol', ['ParlaySocket', 'ParlayEndpoint', '$q', function (ParlaySocket, ParlayEndpoint, $q) {

    function NotImplementedError(method, name) {
        console.warn(method + ' is not implemented for ' + name);
    }
    
    function ParlayProtocol(configuration) {
        'use strict';
        this.id = 0xf201;
        this.protocol_name = configuration.name;
        this.type = configuration.protocol_type;
        this.available_endpoints = [];
        this.active_endpoints = [];
        this.log = [];        
        this.listener_dereg = null;        
        this.on_message_callbacks = [];
        this.fields = {};
        
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
    
    /**
	 * Invokes all callbacks that have been registered with onMessage.
	 * @param {Object} message object to be passed to registered callbacks
	 */
    ParlayProtocol.prototype.invokeCallbacks = function (response) {
        this.on_message_callbacks = this.on_message_callbacks.filter(function (callback) {
            callback(response);            
            return true;
        });
    };
    
    ParlayProtocol.prototype.buildSubscriptionTopics = function () {
        return {
            TOPICS: {
                TO: this.id
            }
        };
    };
    
    ParlayProtocol.prototype.buildSubscriptionListenerTopics = function () {
        return this.buildSubscriptionTopics().TOPICS;
    };
    
    ParlayProtocol.prototype.registerListener = function (topics) {
	    this.listener_dereg = ParlaySocket.onMessage(this.buildSubscriptionListenerTopics(), this.invokeCallbacks.bind(this), true);     
    };
    
    /**
	 * Checks if we have a subscription listener active.
	 * @returns {Boolean} status of registration listener
	 */
    ParlayProtocol.prototype.hasListener = function() {
        return this.listener_dereg !== null;
    };
    
    /**
	 * Records a message into the message log.
	 * @param {Object} message object
	 */
    ParlayProtocol.prototype.recordLog = function(response) {
        this.log.push(response);
    };
    
    /**
	 * Registers a callback to be invoked when a message is received.
	 * @param {Function} callback function
	 */
    ParlayProtocol.prototype.onMessage = function (callback) {
        this.on_message_callbacks.push(callback.bind(this));    
    };
    
    /**
	 * Sends message to ParlaySocket.
	 * @param {Object} topics - 
	 * @param {Object} contents - 
	 * @param {Object} response_topics - 
	 * @returns {$q.defer.promise} resolved when we recieve a response
	 */
    ParlayProtocol.prototype.sendMessage = function (topics, contents, response_topics) {
        return $q(function(resolve, reject) {
            ParlaySocket.sendMessage(topics, contents, response_topics, function (response) {
                if (response.STATUS === 0) resolve(response);
                else reject(response);
            });
        }.bind(this));
    };
    
    ParlayProtocol.prototype.onOpen = function () {
	    // Ensure than the protocol is listening for messages addressed to the UI.
        this.registerListener();
        // Ensure that we record all messages address to the UI.
        this.onMessage(this.recordLog);
    };
    
    ParlayProtocol.prototype.onClose = function () {
        if (this.hasListener()) {
            this.listener_dereg();
            this.listener_dereg = null;
        }
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