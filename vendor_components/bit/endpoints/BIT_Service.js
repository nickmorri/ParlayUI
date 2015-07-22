var bit_endpoints = angular.module('bit.endpoints', ['parlay.endpoints']);

bit_endpoints.factory('CommandEndpoint', ['ParlayEndpoint', function (ParlayEndpoint) {
    function CommandEndpoint(data) {
        this.type = 'CommandEndpoint';
        this.directives = {};        
    }
    
    CommandEndpoint.prototype = Object.create(ParlayEndpoint);
    
    CommandEndpoint.prototype.getType = function () {
        return this.type;
    };
    
    CommandEndpoint.prototype.getDirectives = function () {
        return this.directives;
    };
    
    return CommandEndpoint;
    
}]);

bit_endpoints.factory('BIT_ServiceEndpoint', ['ParlayEndpoint', function (ParlayEndpoint) {
    
    function BIT_ServiceEndpoint(data, protocol) {
        ParlayEndpoint.call(this, data, protocol);

        this.commands = data.commands;
        this.id = data.id;
        this.interfaces = data.interfaces;
        this.type = 'BIT_ServiceEndpoint';
        
        this.directives = {
            'toolbar': ['bitEndpointToolbar'],
            'tabs': ['bitEndpointCardCommands', 'bitEndpointCardLog']
        };
        
        this.commands = Object.keys(data.commands).map(function (command_key) {
            var command = data.commands[command_key];
            command.id = command_key;
            return command;
        });
        
    }
    
    BIT_ServiceEndpoint.prototype = Object.create(ParlayEndpoint.prototype);
    
    BIT_ServiceEndpoint.prototype.getCommands = function () {
        return this.commands;
    };
    
    BIT_ServiceEndpoint.prototype.getMessageTypes = function () {
        return this.protocol.getMessageTypes();
    };
    
    BIT_ServiceEndpoint.prototype.getDataTypes = function () {
        return this.protocol.getDataTypes();
    };
    
    BIT_ServiceEndpoint.prototype.getId = function () {
        return this.id;
    };
    
    BIT_ServiceEndpoint.prototype.getSystemId = function () {
        return this.getId() >> 8;
    };
    
    BIT_ServiceEndpoint.prototype.getDeviceId = function () {
        return this.getId() & 0xff;
    };
    
    BIT_ServiceEndpoint.prototype.getType = function () {
        return this.type;
    };
    
    BIT_ServiceEndpoint.prototype.getFilteredLog = function () {
        return this.protocol.getLog().filter(function (message) {
            return message.topics.from === this.getId();
        }, this);
    };
        
    BIT_ServiceEndpoint.prototype.matchesQuery = function (query) {
        return this.matchesType(query) || this.matchesId(query) || this.matchesName(query);
    };
    
    BIT_ServiceEndpoint.prototype.sendMessage = function (command) {
        return this.protocol.sendCommand(this.generateMessage(command));
    };
    
    BIT_ServiceEndpoint.prototype.matchesType = function (query) {
        return angular.lowercase(this.getType()).indexOf(query) > -1;
    };
    
    BIT_ServiceEndpoint.prototype.matchesId = function (query) {
        return this.getId() === query;
    };
    
    BIT_ServiceEndpoint.prototype.matchesName = function (query) {
        return angular.lowercase(this.getName()).indexOf(query) > -1;
    };
    
    BIT_ServiceEndpoint.prototype.generateMessage = function (message) {
        return {
            'topics': this.generateTopics(message.message_type),
            'contents': this.generateContents(message)
        };
    };
    
    BIT_ServiceEndpoint.prototype.generateTopics = function (message_type) {
        return {
            'to_device': this.getDeviceId(),
            'to_system': this.getSystemId(),
            'to': this.getId(),
            'message_type': this.getMessageTypes().find(function (type) {
                return message_type === type[0];
            })[1]
        };
    };
    
    BIT_ServiceEndpoint.prototype.generateContents = function (message) {
        if (message.message_type === 'COMMAND') return this.generateCommand(message);
        else if (message.message_type === 'COMMAND_RESPONSE') return this.generateCommandResponse(message);
        else if (message.message_type === 'SYSTEM_EVENT') return this.generateSystemEvent(message);
        else return this.generateGenericMessage(message);
    };
    
    BIT_ServiceEndpoint.prototype.generateCommand = function (command) {
        return {
            "command": parseInt(this.getCommands().find(function (item) {
                            return item.command === command.name;
                        }).id, 10),
            'message_info': command.message_info === null ? 0 : command.message_info,
            "payload": {
                "type": this.getDataTypes().find(function (type) {
                            return command.data_buffer_type === type[0];
                        })[1],
                "data": command.data_buffer === null ? [] : command.data_buffer
            }
        };
    };
    
    BIT_ServiceEndpoint.prototype.generateCommandResponse = function (command) {
        return {
            "status": command.status
        };
    };
    
    BIT_ServiceEndpoint.prototype.generateSystemEvent = function (command) {
        return {
            "event": command.event
        };
    };
    
    BIT_ServiceEndpoint.prototype.generateGenericMessage = function (command) {
        return {};
    };
    
    return BIT_ServiceEndpoint;
}]);

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
        $scope.endpoint.sendMessage(collectMessage()).then(function (response) {
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
        return $scope.endpoint.getFilteredLog();
    };
    
}]);

bit_endpoints.directive('bitEndpointToolbar', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/bit/endpoints/directives/bit-endpoint-toolbar.html'
    };
});

bit_endpoints.directive('bitEndpointCardCommands', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/bit/endpoints/directives/bit-endpoint-card-commands.html',
        controller: 'BitEndpointCommandController'
    };
});

bit_endpoints.directive('bitEndpointCardLog', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/bit/endpoints/directives/bit-endpoint-card-log.html',
        controller: 'BitEndpointLogController'
    };
});