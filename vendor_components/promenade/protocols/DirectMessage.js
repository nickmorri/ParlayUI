var direct_message = angular.module('promenade.protocols.directmessage', ['parlay.protocols', 'promenade.endpoints.standardendpoint']);

direct_message.factory('PromenadeDirectMessageProtocol', ['ParlayProtocol', 'PromenadeStandardEndpoint', function (ParlayProtocol, PromenadeStandardEndpoint) {
    
    function PromenadeDirectMessageProtocol(configuration) {
        'use strict';
        ParlayProtocol.call(this, configuration);
        this.current_message_id = 200;
        this.id = 0xf201;
        
        this.endpoint_factory = PromenadeStandardEndpoint;        
    }
    
    PromenadeDirectMessageProtocol.prototype = Object.create(ParlayProtocol.prototype);
    
    PromenadeDirectMessageProtocol.prototype.onOpen = function () {
        this.onMessage(this.recordLog);
        this.subscribe();
    };
    
    PromenadeDirectMessageProtocol.prototype.consumeMessageId = function () {
        return ++this.current_message_id;
    };
    
    PromenadeDirectMessageProtocol.prototype.getMessageId = function () {
        return this.current_message_id;
    };
    
    PromenadeDirectMessageProtocol.prototype.buildMessageTopics = function (message) {
        var new_message = angular.copy(message);
        new_message.topics.MSG_ID = this.consumeMessageId();
        new_message.topics.FROM = this.id;
        return new_message;
    };
    
    PromenadeDirectMessageProtocol.prototype.buildResponseTopics = function (message) {
        return {
            FROM: message.topics.TO,
            TO: message.topics.FROM,
            MSG_ID: message.topics.MSG_ID
        };
    };
    
    PromenadeDirectMessageProtocol.prototype.buildSubscriptionTopics = function () {
        return {
            topics: {
                TO: this.id
            }
        };
    };
    
    PromenadeDirectMessageProtocol.prototype.buildSubscriptionListenerTopics = function () {
        return this.buildSubscriptionTopics().topics;
    };
    
    PromenadeDirectMessageProtocol.prototype.sendCommand = function (message) {
        var new_message = this.buildMessageTopics(message);
        var response_topics = this.buildResponseTopics(new_message);
        return this.sendMessage(new_message.topics, new_message.contents, response_topics);
    };
        
    return PromenadeDirectMessageProtocol;
    
}]);