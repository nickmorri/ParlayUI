var bit_protocols = angular.module('bit.protocols', ['parlay.socket', 'promenade.broker']);

bit_protocols.factory('SSCOM_Serial', ['ParlaySocket', 'PromenadeBroker', 'BrokerAddress', '$q', function (ParlaySocket, PromenadeBroker, BrokerAddress, $q) {
    
    var Private = {
        type: 'SSCOM_Serial',
        common_status: null,
        message_types: null,
        data_types: null,
        current_message_id: 200,
        from_device: 0x01,
        from_system: 0xf2,
        from: 0xf201,
        socket: ParlaySocket(BrokerAddress)
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
    
    Private.buildMessage = function (message) {
        message.topics.message_id = Private.consumeMessageId();
        message.topics.from_device = Private.from_device;
        message.topics.from_system = Private.from_system;
        message.topics.from = Private.from;
        return message;
    };
    
    Private.buildResponse = function (message) {
        return {
            from: message.topics.to,
            to: message.topics.from,
            message_id: message.topics.message_id
        };
    };
    
    Private.subscribe = function () {
        PromenadeBroker.sendSubscribe({to: Private.from}).then(function (response) {
            debugger;
        });
    };
    
    Public.sendCommand = function (message) {
        
        message = Private.buildMessage(message);
        
        return $q(function(resolve, reject) {
            Private.socket.sendMessage(message.topics, message.contents, Private.buildResponse(message), function (response) {
                resolve(response);
            });
        });
    };
    
    Private.subscribe();
    
    return Public;
    
}]);