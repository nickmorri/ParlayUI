var protocols = angular.module('bit.protocols', []);

protocols.factory('SSCOM_Serial', [function () {
    var Private = {
        type: 'SSCOM_Serial',
        base_commands: null,
        common_status: null,
        message_types: null,
        data_types: null
    };
    
    var Public = {};
    
    Public.addDiscoveryInfo = function (info) {
        Private.base_commands = info.base_commands;
        Private.common_status = info.common_status;
        Private.message_types = info.message_types;
        Private.data_types = info.data_types;
    };
    
    Public.getType = function () {
        return Private.type;
    };
    
    return Public;
}]);