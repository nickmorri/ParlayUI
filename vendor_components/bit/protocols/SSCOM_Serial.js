var bit_protocols = angular.module('bit.protocols', ['promenade.protocols.directmessage', 'bit.endpoints']);

bit_protocols.factory('SSComServiceProtocol', ['SSCOM_Serial', function (SSCOM_Serial) {
    
    function SSComServiceProtocol(configuration) {
        SSCOM_Serial.call(this, configuration);
    }
    
    SSComServiceProtocol.prototype = Object.create(SSCOM_Serial.prototype);
    
    return SSComServiceProtocol;
}]);

bit_protocols.factory('SSCOM_Serial', ['PromenadeDirectMessageProtocol', 'BIT_ServiceEndpoint', function (PromenadeDirectMessageProtocol, BIT_ServiceEndpoint) {
    
    function SSCOM_Serial(configuration) {
        'use strict';
        PromenadeDirectMessageProtocol.call(this, configuration);
        
        this.common_status = null;
        this.message_types = null;
        this.data_types = null;
    }
    
    SSCOM_Serial.prototype = Object.create(PromenadeDirectMessageProtocol.prototype);
        
    SSCOM_Serial.prototype.addDiscoveryInfo = function (info) {
        this.common_status = info.common_status;
        this.message_types = info.message_types;
        this.data_types = info.data_types;
        
        this.available_endpoints = info.children.map(function (endpoint) {
            return new BIT_ServiceEndpoint(endpoint, this);
        }, this);        
    };
    
    
    
    return SSCOM_Serial;
    
}]);