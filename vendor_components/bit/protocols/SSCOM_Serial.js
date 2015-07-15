var bit_protocols = angular.module('bit.protocols', ['parlay.socket', 'promenade.broker']);

bit_protocols.factory('SSCOM_Serial', ['ParlaySocket', 'ParlayEndpoint', 'PromenadeBroker', '$q', function (ParlaySocket, ParlayEndpoint, PromenadeBroker, $q) {
    return function SSCOM_Serial () {
    
        var Private = {
            type: 'SSCOM_Serial',
            available_endpoints: [],
            active_endpoints: [],
            common_status: null,
            message_types: null,
            data_types: null,
            current_message_id: 200,
            from_device: 0x01,
            from_system: 0xf2,
            from: 0xf201,
            log: [],
            onMessageCallbacks: [],
            subscription_listener_dereg: null
        };
        
        var Public = {};
        
        Public.getAvailableEndpoints = function () {
            return Private.available_endpoints;
        };
        
        Public.getActiveEndpoints = function () {
            return Private.active_endpoints;
        };
        
        Public.addDiscoveryInfo = function (info) {
            Private.common_status = info.common_status;
            Private.message_types = info.message_types;
            Private.data_types = info.data_types;
            
            Private.available_endpoints = info.children.map(function (endpoint) {
                return new ParlayEndpoint(endpoint, Public);
            });
            
        };
        
        Public.activateEndpoint = function (endpoint) {
            var index = Private.available_endpoints.findIndex(function (suspect) {
                return endpoint === suspect;
            });
            
            if (index > -1) Private.available_endpoints.splice(index, 1);
            
            Private.active_endpoints.push(endpoint);
        };
        
        Public.getType = function () {
            return Private.type;
        };
        
        Public.onOpen = function () {
            Public.onMessage(Private.recordLog);
            Public.subscribe();
        };
        
        Public.onClose = function () {
            if (Private.subscription_listener_dereg !== null) {
                Private.subscription_listener_dereg();
                Private.subscription_listener_dereg = null;
            }
            Private.available_endpoints = [];
            Private.active_endpoints = [];
        };
        
        Public.hasSubscription = function() {
            return Private.subscription_listener_dereg !== null;
        };
        
        Public.subscribe = function () {
            PromenadeBroker.sendSubscribe({topics: {to_system: Private.from_system}}).then(function (response) {
                Private.subscription_listener_dereg = ParlaySocket.onMessage({to_system: Private.from_system}, Private.invokeCallbacks, true);
            });
        };
        
        Public.unsubscribe = function () {
            PromenadeBroker.sendUnsubscribe({topics: {to_system: Private.from_system}}).then(function (response) {
                Public.afterClose();
            });
        };
        
        Public.sendCommand = function (message) {            
            return $q(function(resolve, reject) {
                message = Private.buildMessageTopics(message);
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
        
        Public.getLog = function () {
            return Private.log;
        };
        
        Public.onMessage = function (callback) {
            Private.onMessageCallbacks.push(callback);
        };
        
        Private.recordLog = function (response) {
            Private.log.push(response);        
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
        
        Private.invokeCallbacks = function (response) {
            Private.onMessageCallbacks = Private.onMessageCallbacks.filter(function (callback) {
                callback(response);            
                return true;
            });
        };
        
        return Public;
    
    };
    
}]);