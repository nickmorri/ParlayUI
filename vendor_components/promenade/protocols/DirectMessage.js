var direct_message = angular.module('promenade.protocols.directmessage', ['parlay.protocols', 'promenade.endpoints.standardendpoint']);

direct_message.factory('PromenadeDirectMessageProtocol', ['ParlayProtocol', 'PromenadeStandardEndpoint', function (ParlayProtocol, PromenadeStandardEndpoint) {
    
    function PromenadeDirectMessageProtocol(configuration) {
        'use strict';
        // Call the constructor of the prototype we inherit from.
        ParlayProtocol.call(this, configuration);
        
        // Set our own endpoint_factory.
        this.endpoint_factory = PromenadeStandardEndpoint;
        
        // Defining custom attributes.
        this.current_message_id = 200;
    }
    
    // Create a Object that inherits from the prototype of ParlayProtocol.
    PromenadeDirectMessageProtocol.prototype = Object.create(ParlayProtocol.prototype);
    
    PromenadeDirectMessageProtocol.prototype.consumeMessageId = function () {
        return ++this.current_message_id;
    };
    
    PromenadeDirectMessageProtocol.prototype.getMessageId = function () {
        return this.current_message_id;
    };
    
    PromenadeDirectMessageProtocol.prototype.buildMessageTopics = function (message) {
        var new_message = angular.copy(message);
        new_message.TOPICS.MSG_ID = this.consumeMessageId();
        new_message.TOPICS.FROM = this.id;
        return new_message;
    };
    
    PromenadeDirectMessageProtocol.prototype.buildResponseTopics = function (message) {
        return {
            FROM: message.TOPICS.TO,
            TO: message.TOPICS.FROM,
            MSG_ID: message.TOPICS.MSG_ID
        };
    };
    
    PromenadeDirectMessageProtocol.prototype.sendCommand = function (message) {
        var new_message = this.buildMessageTopics(message);
        var response_topics = this.buildResponseTopics(new_message);
        return this.sendMessage(new_message.TOPICS, new_message.CONTENTS, response_topics);
    };
        
    return PromenadeDirectMessageProtocol;    
}]);