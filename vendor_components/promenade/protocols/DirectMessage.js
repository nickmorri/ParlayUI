function PromenadeDirectMessageProtocolFactory(ParlayProtocol, PromenadeStandardEndpoint, $q) {
    "use strict";

    /**
	 * PromenadeDirectMessageProtocol constructor.
	 * Prototypically inherits from ParlayProtocol.
	 * @constructor
	 */
    function PromenadeDirectMessageProtocol(configuration) {
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
	 * @param {Object} topics - partially constructed message.
	 * @returns {Object} - partially constructed message with topics.
	 */
    PromenadeDirectMessageProtocol.prototype.buildMessageTopics = function (topics) {
        var new_topics = angular.copy(topics);
        new_topics.MSG_ID = this.consumeMessageId();
        new_topics.FROM = this.id;
        return new_topics;
    };
    
    /**
	 * Constructs response topics from the partially built given message.
	 * @param {Object} topics - partially constructed message, includes topics.
	 * @returns {Object} - partially constructed message with response topics.
	 */
    PromenadeDirectMessageProtocol.prototype.buildResponseTopics = function (topics) {
        return {
            FROM: topics.TO,
            TO: topics.FROM,
            MSG_ID: topics.MSG_ID
        };
    };
    
    PromenadeDirectMessageProtocol.prototype.isResponseOk = function (response) {
	    return ["ERROR", "WARNING"].indexOf(response.TOPICS.MSG_STATUS) === -1;
    };
    
    /**
	 * Sends message with topics specific to PromenadeDirectMessage.
	 * @param {Object} topics - Map of key/value pairs.
	 * @param {Object} contents - Map of key/value pairs.
	 * @param {Object} response_topics - Map of key/value pairs.
	 * @returns {$q.defer.Promise} - Resolved upon message receipt.
	 */
    PromenadeDirectMessageProtocol.prototype.sendMessage = function (topics, contents, response_topics) {
		var extended_topics = this.buildMessageTopics(topics);
		var extended_response_topics = !response_topics ? this.buildResponseTopics(extended_topics) : response_topics;
		
	    return ParlayProtocol.prototype.sendMessage(extended_topics, contents, extended_response_topics, true).then(function (response) {
		    return this.isResponseOk(response) ? response.CONTENTS : $q.reject(response.CONTENTS);
	    }.bind(this));
    };
        
    return PromenadeDirectMessageProtocol;    
}

angular.module("promenade.protocols.directmessage", ["parlay.protocols.protocol", "promenade.endpoints.standardendpoint"])
	.factory("PromenadeDirectMessageProtocol", ["ParlayProtocol", "PromenadeStandardEndpoint", "$q", PromenadeDirectMessageProtocolFactory]);