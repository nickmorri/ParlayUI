var direct_message = angular.module('promenade.protocols.directmessage', ['parlay.protocols']);

direct_message.factory('PromenadeDirectMessageProtocol', ['ParlayProtocol', 'PromenadeDirectMessageEndpoint', function (ParlayProtocol, PromenadeDirectMessageEndpoint) {
    
    function PromenadeDirectMessageProtocol(configuration) {
        'use strict';
        ParlayProtocol.call(this, configuration);
        this.current_message_id = 200;
        this.from_device = 0x01;
        this.from_system = 0xf2;
        this.from = 0xf201;
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
    
    PromenadeDirectMessageProtocol.prototype.buildSubscriptionTopics = function () {
        return {
            topics: {
                to_system: this.from_system
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
    
    PromenadeDirectMessageProtocol.prototype.addDiscoveryInfo = function (info) {
        this.available_endpoints = info.children.map(function (endpoint) {
            return new PromenadeDirectMessageEndpoint(endpoint, this);
        }, this);        
    };
    
    PromenadeDirectMessageProtocol.prototype.buildMessageTopics = function () {
        throw NotImplementedError('buildMessageTopics');
    };
    
    PromenadeDirectMessageProtocol.prototype.buildResponseTopics = function () {
        throw NotImplementedError('buildResponseTopics');
    };
    
    return PromenadeDirectMessageProtocol;
    
}]);