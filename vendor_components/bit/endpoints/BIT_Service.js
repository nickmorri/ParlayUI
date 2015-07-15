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

bit_endpoints.factory('BIT_Service', function () {
    return function BIT_Service (data, protocol) {
        
        var Public = {};
        
        Public.getCommands = function () {
            return Private.commands;
        };
        
        Public.getMessageTypes = function () {
            return protocol.getMessageTypes();
        };
        
        Public.getDataTypes = function () {
            return protocol.getDataTypes();
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
        
        Public.getFilteredLog = function () {
            return protocol.getLog().filter(function (message) {
                return message.topics.from === Private.id;
            });
        };
            
        Public.matchesQuery = function (query) {
            return Private.matchesType(query) || Private.matchesId(query) || Private.matchesName(query);
        };
        
        Public.sendMessage = function (command) {
            return protocol.sendCommand(Private.generateMessage(command));
        };
        
        var Private = {
            protocol: protocol,
            commands: null,
            id: null,
            interfaces: null,
            name: null,
            type: 'BIT_Service',
            directives: {
                'toolbar': ['bitEndpointToolbar'],
                'tabs': ['bitEndpointCardCommands', 'bitEndpointCardLog']
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
});

bit_endpoints.controller('BitEndpointCommandController', ['$scope', '$timeout', function ($scope, $timeout) {
    
    $scope.message_type = 'COMMAND';
    $scope.message_info = null;
    $scope.data_buffer_type = null;
    $scope.data_buffer = null;
    $scope.command = {};
    
    $scope.buffer_help = null;
    $scope.info_help = null;

    $scope.sending = false;
    $scope.send_button_text = 'Send';
    
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
    
    function collectMessage () {
        if ($scope.message_type === 'COMMAND') return collectCommand();
        else if ($scope.message_type === 'COMMAND_RESPONSE') return collectCommandResponse();
        else if ($scope.message_type === 'SYSTEM_EVENT') return collectSystemEvent();
        else return collectGenericMessage();
    }
    
    $scope.send = function () {
        $scope.interface.sendMessage(collectMessage()).then(function (response) {
            $scope.send_button_text = 'Sent!';
            $timeout(function () {
                $scope.send_button_text = 'Send';
            }, 1000);
            $scope.sending = false;
        }).catch(function (response) {
            console.warn(response);
        });
    };
    
}]);

bit_endpoints.controller('BitEndpointLogController', ['$scope', function ($scope) {
    
    $scope.getLog = function () {
        return $scope.interface.getFilteredLog();
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

bit_endpoints.directive('bitEndpointCardCommands', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/bit/endpoints/directives/bit-endpoint-card-commands.html',
        link: bitLinkFunction,
        controller: 'BitEndpointCommandController'
    };
});

bit_endpoints.directive('bitEndpointCardLog', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/bit/endpoints/directives/bit-endpoint-card-log.html',
        link: bitLinkFunction,
        controller: 'BitEndpointLogController'
    };
});