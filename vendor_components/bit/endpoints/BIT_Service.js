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
            
        Public.matchesQuery = function (query) {
            return Private.matchesType(query) || Private.matchesId(query) || Private.matchesName(query);
        };
        
        Public.sendMessage = function (command) {
            return SSCOM_Serial.sendCommand(Private.generateMessage(command));
        };
        
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
        
        Private.matchesType = function (query) {
            return angular.lowercase(Public.getType()).indexOf(query) > -1;
        };
        
        Private.matchesId = function (query) {
            return Public.getId() === query;
        };
        
        Private.matchesName = function (query) {
            return angular.lowercase(Public.getName()).indexOf(query) > -1;
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
        
        Private.generateMessage = function (message) {
            return {
                'topics': Private.generateTopics(message.message_type),
                'contents': Private.generateContents(message)
            };
        };
        
        Private.generateTopics = function (message_type) {
            
            function messageTypeToCode (type_string) {
                return Public.getMessageTypes().find(function (type) {
                    return type_string === type[0];
                })[1];
            }
            
            return {
                'to_device': Public.getDeviceId(),
                'to_system': Public.getSystemId(),
                'to': Public.getId(),
                'message_type': messageTypeToCode (message_type)
            };
        };
        
        Private.generateContents = function (message) {
            if (message.message_type === 'COMMAND') return Private.generateCommand(message);
            else if (message.message_type === 'COMMAND_RESPONSE') return Private.generateCommandResponse(message);
            else if (message.message_type === 'SYSTEM_EVENT') return Private.generateSystemEvent(message);
            else return Private.generateGenericMessage(message);
        };
        
        Private.generateCommand = function (command) {
            
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
                "command": commandStringToCode(command.command),
                'message_info': command.message_info === null ? 0 : command.message_info,
                "payload": {
                    "type": dataBufferTypeStringToCode (command.data_buffer_type),
                    "data": command.data_buffer === null ? [] : command.data_buffer
                }
            };
        };
        
        Private.generateCommandResponse = function (command) {
            return {
                "status": command.status
            };
        };
        
        Private.generateSystemEvent = function (command) {
            return {
                "event": command.event
            };
        };
        
        Private.generateGenericMessage = function (command) {
            return {};
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
    
    function collectCommand () {
        return {
            message_type: $scope.message_type,
            command: $scope.command,
            data_buffer_type: $scope.data_buffer_type,
            message_info: $scope.message_info,
            data_buffer: $scope.data_buffer
        };
    }
    
    function collectCommandResponse () {
        return {
            message_type: $scope.message_type,
            status: $scope.status
        };
    }
    
    function collectSystemEvent () {
        return {
            message_type: $scope.message_type,
            event: $scope.event
        };
    }
    
    function collectGenericMessage () {
        return {
            message_type: $scope.message_type
        };
    }
    
    $scope.send = function () {
        $scope.sending = true;
        
        var message;
        
        if ($scope.message_type === 'COMMAND') message = collectCommand();
        else if ($scope.message_type === 'COMMAND_RESPONSE') message = collectCommandResponse();
        else if ($scope.message_type === 'SYSTEM_EVENT') message = collectSystemEvent();
        else message = collectGenericMessage();
        
        $scope.interface.sendMessage(message).then(function (response) {
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