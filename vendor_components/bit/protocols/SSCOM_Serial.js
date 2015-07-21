var bit_protocols = angular.module('bit.protocols', ['parlay.socket', 'promenade.broker', 'parlay.endpoints']);

bit_protocols.factory('SSComServiceProtocol', ['SSCOM_Serial', function (SSCOM_Serial) {
 
    function SSComServiceProtocol(configuration) {
        SSCOM_Serial.call(this, configuration);
    }
    
    SSComServiceProtocol.prototype = Object.create(SSCOM_Serial.prototype);
    SSComServiceProtocol.prototype.constructor = SSComServiceProtocol;
    
    return SSComServiceProtocol;
}]);

bit_protocols.factory('SSCOM_Serial', ['Protocol', 'ParlayEndpoint', function (Protocol, ParlayEndpoint) {
    
    function SSCOM_Serial(configuration) {
        this.name = configuration.name;
        this.type = configuration.protocol_type;
        
        this.common_status = null;
        this.message_types = null;
        this.data_types = null;
        this.current_message_id = 200;
        this.from_device = 0x01;
        this.from_system = 0xf2;
        this.from = 0xf201;
    }
    
    SSCOM_Serial.prototype = new Protocol();
        
    SSCOM_Serial.prototype.addDiscoveryInfo = function (info) {
        this.common_status = info.common_status;
        this.message_types = info.message_types;
        this.data_types = info.data_types;
        
        this.available_endpoints = info.children.map(function (endpoint) {
            return new ParlayEndpoint(endpoint, this);
        }, this);
        
    };
    
    SSCOM_Serial.prototype.buildSubscriptionTopics = function () {
        return {
            topics: {
                to_system: this.from_system
            }
        };
    };
    
    SSCOM_Serial.prototype.buildSubscriptionListenerTopics = function () {
        return {
            to_system: this.from_system
        };
    };
    
    SSCOM_Serial.prototype.getName = function () {
        return this.name;
    };
    
    SSCOM_Serial.prototype.onOpen = function () {
        this.onMessage(this.recordLog);
        this.subscribe();
    };
            
    SSCOM_Serial.prototype.onClose = function () {
        Protocol.prototype.onClose.call(this);
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
    
    SSCOM_Serial.prototype.consumeMessageId = function () {
        return ++this.current_message_id;
    };
        
    SSCOM_Serial.prototype.buildMessageTopics = function (message) {
        message.topics.message_id = this.consumeMessageId();
        message.topics.from_device = this.from_device;
        message.topics.from_system = this.from_system;
        message.topics.from = this.from;
        return message;
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
    
    SSCOM_Serial.prototype.sendCommand = function () {
        return $q(function(resolve, reject) {
            message = this.buildMessageTopics(message);
            if (message.topics.message_type === 0) {
                ParlaySocket.sendMessage(message.topics, message.contents, this.buildResponseTopics(message), function (response) {
                    if (response.status === 0) resolve(response);
                    else reject(response);
                });   
            }
            else {
                ParlaySocket.sendMessage(message.topics, message.contents);                
            }
        });
    };
    
    return SSCOM_Serial;
    
}]);