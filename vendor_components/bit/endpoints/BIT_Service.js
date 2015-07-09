var bit_endpoints = angular.module('bit.endpoints', ['bit.protocols']);

bit_endpoints.factory('CommandEndpoint', function () {
    return function CommandEndpoint (data) {

        var Private = {
            type: 'CommandEndpoint',
            directives: {}
        };
        
        var Public = {};
        
        Private.addData = function (data) {
            
        };
        
        Public.getType = function () {
            return Private.type;
        };
        
        Public.getDirectives = function () {
            return Private.directives;
        };
        
        Private.addData(data);
            
        return Public;
    };
});

bit_endpoints.factory('BIT_Service', ['SSCOM_Serial', function (SSCOM_Serial) {
    return function BIT_Service (data) {
        
        var Private = {
            commands: null,
            id: null,
            interfaces: null,
            name: null,
            type: 'BIT_Service',
            directives: {
                'info': 'bitEndpointCardInfo',
                'toolbar': 'bitEndpointToolbar'
            }
        };
        
        Private.addData = function (data) {
            Private.interfaces = data.interfaces;
            Private.id = data.id;
            Private.name = data.name;
            
            Private.commands = Object.keys(data.commands).map(function (command_key) {
                var command = data.commands[command_key];
                command.id = command_key;
                return command;
            });
            
        };
        
        var Public = {
            sending: false
        };
        
        Public.getCommands = function () {
            return Private.commands;
        };
        
        Public.getMessageTypes = function () {
            return SSCOM_Serial.getMessageTypes();
        };
        
        Public.getDataTypes = function () {
            return SSCOM_Serial.getDataTypes();
        };
        
        Public.getId = function () {
            return Private.id;
        };
        
        Public.getSystemId = function () {
            return Public.getId() >> 8;
        };
        
        Public.getDeviceId = function () {
            return Public.getId() & 0xff;
        };
        
        Public.getName = function () {
            return Private.name;
        };
        
        Public.getType = function () {
            return Private.type;
        };
        
        Public.getDirectives = function () {
            return Private.directives;
        };
            
        Public.doCommand = function (command) {
            Public.sending = true;
            SSCOM_Serial.sendCommand(Private.generateCommand(command)).then(function (response) {
                Public.sending = false;
                debugger;
            });
        };    
        
        Private.generateCommand = function (command) {
            return {
                'topics': {
                    'to_device': '0x' + Public.getDeviceId(),
                    'to_system': '0x' + Public.getSystemId(),
                    'to': '0x' + Public.getSystemId() + Public.getDeviceId(),
                    'message_type': command.message_type[1]
                },
                'contents': {
                    "command": '0x' + parseInt(command.id), 
                    'message_info': command.message_info !== undefined ? command.message_info : 0,
                    "payload": {
                        "type": command.data_buffer_type[1],
                        "data": command.data_buffer !== undefined ? command.data_buffer : null
                    }
                }
            };
        };
        
        Private.addData(data);
            
        return Public;
    };    
}]);

function bitLinkFunction (scope, element, attributes) {
    scope.interface = scope.endpoint.getVendorInterface('BIT_Service');
}

bit_endpoints.directive('bitEndpointToolbar', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/bit/endpoints/directives/bit-endpoint-toolbar.html',
        link: bitLinkFunction
    };
});

bit_endpoints.directive('bitEndpointCardInfo', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/bit/endpoints/directives/bit-endpoint-info.html',
        link: bitLinkFunction
    };
});