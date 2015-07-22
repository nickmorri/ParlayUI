var direct_message = angular.module('parlay.protocols.directmessage', ['parlay.protocols']);

direct_message.factory('ParlayDirectMessageProtocol', ['ParlayProtocol', 'ParlayDirectMessageEndpoint', function (ParlayProtocol, ParlayDirectMessageEndpoint) {
    
    function ParlayDirectMessageProtocol(configuration) {
        'use strict';
        ParlayProtocol.call(this, configuration);
        this.current_message_id = 200;
        this.from_device = 0x01;
        this.from_system = 0xf2;
        this.from = 0xf201;
    }
    
    ParlayDirectMessageProtocol.prototype = Object.create(ParlayProtocol.prototype);
    
    ParlayDirectMessageProtocol.prototype.onOpen = function () {
        this.onMessage(this.recordLog);
        this.subscribe();
    };
    
    ParlayDirectMessageProtocol.prototype.consumeMessageId = function () {
        return ++this.current_message_id;
    };
    
    ParlayDirectMessageProtocol.prototype.buildSubscriptionTopics = function () {
        return {
            topics: {
                to_system: this.from_system
            }
        };
    };
    
    ParlayDirectMessageProtocol.prototype.buildSubscriptionListenerTopics = function () {
        return this.buildSubscriptionTopics().topics;
    };
    
    ParlayDirectMessageProtocol.prototype.sendCommand = function (message) {
        var new_message = this.buildMessageTopics(message);
        var response_topics = this.buildResponseTopics(new_message);
        return this.sendMessage(new_message.topics, new_message.contents, response_topics);
    };
    
    ParlayDirectMessageProtocol.prototype.addDiscoveryInfo = function (info) {
        this.available_endpoints = info.children.map(function (endpoint) {
            return new ParlayDirectMessageEndpoint(endpoint, this);
        }, this);        
    };
    
    ParlayDirectMessageProtocol.prototype.buildMessageTopics = function () {
        throw NotImplementedError('buildMessageTopics');
    };
    
    ParlayDirectMessageProtocol.prototype.buildResponseTopics = function () {
        throw NotImplementedError('buildResponseTopics');
    };
    
    return ParlayDirectMessageProtocol;
    
}]);