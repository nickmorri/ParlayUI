var direct_message = angular.module('promenade.protocols.directmessage', ['parlay.protocols.protocol', 'promenade.endpoints.standardendpoint']);

direct_message.factory('PromenadeDirectMessageProtocol', ['ParlayProtocol', 'PromenadeStandardEndpoint', function (ParlayProtocol, PromenadeStandardEndpoint) {
    
    function PromenadeDirectMessageProtocol(configuration) {
        "use strict";
        // Call the constructor of the prototype we inherit from.
        ParlayProtocol.call(this, configuration);
        
        // Set our own endpoint_factory.
        this.endpoint_factory = PromenadeStandardEndpoint;
        
        // Defining custom attributes.
        this.current_message_id = 200;
    }
    
    // Create a Object that inherits from the prototype of ParlayProtocol.
    PromenadeDirectMessageProtocol.prototype = Object.create(ParlayProtocol.prototype);
    
    /**
	 * Consumes a message ID by incrementing then returning this new ID.
	 * @returns {Number} - current message ID
	 */
    PromenadeDirectMessageProtocol.prototype.consumeMessageId = function () {
        return ++this.current_message_id;
    };
    
    /**
	 * Returns the current message ID.
	 * @returns {Number} - current message ID.
	 */
    PromenadeDirectMessageProtocol.prototype.getMessageId = function () {
        return this.current_message_id;
    };
    
    /**
	 * Constructs message topics from the partially built given message.
	 * @param {Object} message - partially constructed message.
	 * @returns {Object} - partially constructed message with topics.
	 */
    PromenadeDirectMessageProtocol.prototype.buildMessageTopics = function (message) {
        var new_message = angular.copy(message);
        new_message.TOPICS.MSG_ID = this.consumeMessageId();
        new_message.TOPICS.FROM = this.id;
        return new_message;
    };
    
    /**
	 * Constructs response topics from the partially built given message.
	 * @param {Object} message - partially constructed message, includes topics.
	 * @returns {Object} - partially construtcted message with response topics.
	 */
    PromenadeDirectMessageProtocol.prototype.buildResponseTopics = function (message) {
        return {
            FROM: message.TOPICS.TO,
            TO: message.TOPICS.FROM,
            MSG_ID: message.TOPICS.MSG_ID
        };
    };
    
    /**
	 * Sends a constructed message over our protocol.
	 * @param {Object} message - partially constructed message, we add topics and response topics.
	 * @returns {$q.defer.Promise} - resolved when we receive a response.
	 */
    PromenadeDirectMessageProtocol.prototype.sendCommand = function (message) {
        var new_message = this.buildMessageTopics(message);
        var response_topics = this.buildResponseTopics(new_message);
        return this.sendMessage(new_message.TOPICS, new_message.CONTENTS, response_topics);
    };
        
    return PromenadeDirectMessageProtocol;    
}]);