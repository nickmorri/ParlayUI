var bit_endpoints = angular.module('bit.endpoints', ['bit.protocols']);

bit_endpoints.factory('CommandEndpoint', function () {
    return function CommandEndpoint (data) {

        var Private = {
            type: 'CommandEndpoint',
            directives: {}
        };
        
        var Public = {};
        
        Private.addData = function (data) {};
        
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
        
        var Public = {};
        
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
            return SSCOM_Serial.sendCommand(Private.generateCommand(command));
        };
        
        Public.matchesQuery = function (query) {
            
            var matches_type = angular.lowercase(Public.getType()).indexOf(query) > -1;
            var matches_id = Public.getId() === query;
            var matches_name = angular.lowercase(Public.getName()).indexOf(query) > -1;
            
            return matches_type || matches_id || matches_name;
        };
        
        Private.generateCommand = function (command) {
            
            function messageTypeToCode (type_string) {
                return Public.getMessageTypes().find(function (type) {
                    return type_string === type[0];
                })[1];
            }
            
            function commandStringToCode (command_string) {
                return parseInt(Public.getCommands().find(function (command) {
                    return command_string === command.name;
                }).id, 10);
            }
            
            function dataBufferTypeStringToCode (type_string) {
                return Public.getDataTypes().find(function (type) {
                    return type_string === type[0];
                })[1];
            }
            
            return {
                'topics': {
                    'to_device': '0x' + Public.getDeviceId(),
                    'to_system': '0x' + Public.getSystemId(),
                    'to': '0x' + Public.getSystemId() + Public.getDeviceId(),
                    'message_type': messageTypeToCode (command.message_type)
                },
                'contents': {
                    "command": '0x' + commandStringToCode(command.command),
                    'message_info': command.message_info,
                    "payload": {
                        "type": dataBufferTypeStringToCode (command.data_buffer_type),
                        "data": command.data_buffer
                    }
                }
            };
        };
        
        Private.addData(data);
            
        return Public;
    };    
}]);

bit_endpoints.controller('BitEndpointInfoController', ['$scope', function ($scope) {
    
    $scope.message_type = 'COMMAND';
    $scope.message_info = null;
    $scope.data_buffer_type = null;
    $scope.data_buffer = null;
    $scope.command = {};
    
    $scope.buffer_help = null;
    $scope.info_help = null;

    $scope.sending = false;
    
    $scope.selectMessageType = function (type) {
        $scope.message_type = type;
    };
    
    $scope.selectCommand = function (command) {
        $scope.command = command.name;
        $scope.data_buffer_type = command.data_type;
        
        $scope.buffer_help = command.buffer_help === '' ? null : command.buffer_help;
        $scope.info_help = command.info_help === '' ? null : command.info_help;
    };
    
    $scope.doCommand = function () {
        $scope.sending = true;
        $scope.interface.doCommand({
            message_type: $scope.message_type,
            command: $scope.command,
            data_buffer_type: $scope.data_buffer_type,
            message_info: $scope.message_info,
            data_buffer: $scope.data_buffer
        }).then(function (response) {
            $scope.sending = false;
        });
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
        link: bitLinkFunction,
        controller: 'BitEndpointInfoController'
    };
});