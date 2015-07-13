var bit_protocols = angular.module('bit.protocols', ['parlay.socket', 'promenade.broker']);

bit_protocols.factory('SSCOM_Serial', ['ParlaySocket', 'PromenadeBroker', '$q', function (ParlaySocket, PromenadeBroker, $q) {
    
    var Private = {
        type: 'SSCOM_Serial',
        common_status: null,
        message_types: null,
        data_types: null,
        current_message_id: 200,
        from_device: 0x01,
        from_system: 0xf2,
        from: 0xf201
    };
    
    var Public = {};
    
    Public.addDiscoveryInfo = function (info) {
        Private.common_status = info.common_status;
        Private.message_types = info.message_types;
        Private.data_types = info.data_types;
    };
    
    Public.getType = function () {
        return Private.type;
    };
    
    Private.getCommonStatus = function () {
        return Private.common_status;  
    };
    
    Public.getMessageTypes = function () {
        return Private.message_types;
    };
    
    Public.getDataTypes = function () {
        return Private.data_types;
    };
    
    Private.consumeMessageId = function () {
        return ++Private.current_message_id;
    };
        
    Private.buildMessageTopics = function (message) {
        message.topics.message_id = Private.consumeMessageId();
        message.topics.from_device = Private.from_device;
        message.topics.from_system = Private.from_system;
        message.topics.from = Private.from;
        return message;
    };
    
    Private.buildResponseTopics = function (message) {
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
    
    Private.subscribe = function () {
        PromenadeBroker.sendSubscribe({topics: {to_system: Private.from_system}});
    };
    
    Public.sendCommand = function (message) {
        
        message = Private.buildMessageTopics(message);
        
        return $q(function(resolve, reject) {
            if (message.topics.message_type === 0) {
                ParlaySocket.sendMessage(message.topics, message.contents, Private.buildResponseTopics(message), function (response) {
                    if (response.status === 0) resolve(response);
                    else reject(response);
                });   
            }
            else {
                ParlaySocket.sendMessage(message.topics, message.contents);                
            }
        });
    };
    
    ParlaySocket.onMessage({
        to: Private.from,
        to_device: Private.from_device,
        to_system: Private.from_system
    }, function (response) {
        debugger;
    });
    
    Private.subscribe();
    
    return Public;
    
}]);