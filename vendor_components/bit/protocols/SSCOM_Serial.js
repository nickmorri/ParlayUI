var protocols = angular.module('bit.protocols', ['parlay.socket']);

protocols.value('BrokerAddress', 'ws://' + location.hostname + ':8085');

protocols.factory('SSCOM_Serial', ['ParlaySocket', 'BrokerAddress', '$q', function (ParlaySocket, BrokerAddress, $q) {
    var Private = {
        type: 'SSCOM_Serial',
        common_status: null,
        message_types: null,
        data_types: null,
        current_message_id: 200,
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
    
    Public.sendCommand = function (command) {
        
        command.topics.message_id = Private.consumeMessageId();
        command.topics.from_device = 0x01;
        command.topics.from_system = 0xf2;
        command.topics.from = 0xf201;
        
        var response_topics = {
            from: command.topics.to,
            to: command.topics.from,
            message_id: command.topics.message_id
        };
        
        return $q(function(resolve, reject) {
            Private.socket.sendMessage(command.topics, command.contents, response_topics, function (response) {
                resolve(response);
            });
        });
    };
    
    return Public;
}]);