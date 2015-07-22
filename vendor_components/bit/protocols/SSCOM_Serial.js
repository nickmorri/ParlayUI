var bit_protocols = angular.module('bit.protocols', ['parlay.protocols.directmessage', 'bit.endpoints']);

bit_protocols.factory('SSComServiceProtocol', ['SSCOM_Serial', function (SSCOM_Serial) {
    
    function SSComServiceProtocol(configuration) {
        SSCOM_Serial.call(this, configuration);
    }
    
    SSComServiceProtocol.prototype = Object.create(SSCOM_Serial.prototype);
    
    return SSComServiceProtocol;
}]);

bit_protocols.factory('SSCOM_Serial', ['ParlayDirectMessageProtocol', 'BIT_ServiceEndpoint', function (ParlayDirectMessageProtocol, BIT_ServiceEndpoint) {
    
    function SSCOM_Serial(configuration) {
        'use strict';
        ParlayDirectMessageProtocol.call(this, configuration);
        
        this.common_status = null;
        this.message_types = null;
        this.data_types = null;
    }
    
    SSCOM_Serial.prototype = Object.create(ParlayDirectMessageProtocol.prototype);
        
    SSCOM_Serial.prototype.addDiscoveryInfo = function (info) {
        this.common_status = info.common_status;
        this.message_types = info.message_types;
        this.data_types = info.data_types;
        
        this.available_endpoints = info.children.map(function (endpoint) {
            return new BIT_ServiceEndpoint(endpoint, this);
        }, this);        
    };
    
    SSCOM_Serial.prototype.getCommonStatus = function () {
        return this.common_status;  
    };
    
    SSCOM_Serial.prototype.getMessageTypes = function () {
        return this.message_types;
    };
    
    SSCOM_Serial.prototype.getDataTypes = function () {
        return this.data_types;
    };
        
    SSCOM_Serial.prototype.buildMessageTopics = function (message) {
        var new_message = angular.copy(message);
        new_message.topics.message_id = this.consumeMessageId();
        new_message.topics.from_device = this.from_device;
        new_message.topics.from_system = this.from_system;
        new_message.topics.from = this.from;
        return new_message;
    };
    
    SSCOM_Serial.prototype.buildResponseTopics = function (message) {
        return {
            from: message.topics.to,
            from_system: message.topics.to_system,
            message_type: 2,
            message_type_name: 'COMMAND_RESPONSE',
            to: message.topics.from,
            to_system: message.topics.from_system,
            message_id: message.topics.message_id
        };
    };
    
    return SSCOM_Serial;
    
}]);