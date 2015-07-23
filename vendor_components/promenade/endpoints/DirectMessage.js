var direct_message_endpoints = angular.module('promenade.endpoints.directmessage', ['parlay.endpoints']);

direct_message_endpoints.factory('PromenadeDirectMessageEndpoint', ['ParlayEndpoint', function (ParlayEndpoint) {
    
    function PromenadeDirectMessageEndpoint(data, protocol) {
        ParlayEndpoint.call(this, data, protocol);
        
        this.type = 'DirectMessageEndpoint';
        this.commands = data.commands;
        this.id = data.id;
        
        this.directives.toolbar.push('promenadeDirectMessageEndpointCardToolbar');
        this.directives.tabs.push('promenadeDirectMessageEndpointCardLog', 'promenadeDirectMessageEndpointCardCommands');
        
        this.commands = Object.keys(data.commands).map(function (command_key) {
            var command = data.commands[command_key];
            command.id = parseInt(command_key, 10);
            return command;
        });
    }
    
    PromenadeDirectMessageEndpoint.prototype = Object.create(ParlayEndpoint.prototype);
    
    Object.defineProperty(PromenadeDirectMessageEndpoint.prototype, 'message_types', {
        get: function () {
            return this.protocol.message_types;    
        }
    });
    
    Object.defineProperty(PromenadeDirectMessageEndpoint.prototype, 'data_types', {
        get: function () {
            return this.protocol.data_types;
        }
    });
    
    Object.defineProperty(PromenadeDirectMessageEndpoint.prototype, 'system_id', {
        get: function () {
            return this.id >> 8;    
        }
    });
    
    Object.defineProperty(PromenadeDirectMessageEndpoint.prototype, 'device_id', {
        get: function () {
            return this.id & 0xff;
        }
    });
    
    Object.defineProperty(PromenadeDirectMessageEndpoint.prototype, 'log', {
       get: function () {
           return this.protocol.getLog().filter(function (message) {
                return message.topics.from === this.id;
            }, this);
       } 
    });
    
    PromenadeDirectMessageEndpoint.prototype.matchesType = function (query) {
        return angular.lowercase(this.getType()).indexOf(query) > -1;
    };
    
    PromenadeDirectMessageEndpoint.prototype.matchesName = function (query) {
        return angular.lowercase(this.getName()).indexOf(query) > -1;
    };
    
    PromenadeDirectMessageEndpoint.prototype.matchesQuery = function (query) {
        return this.matchesType(query) || this.matchesId(query) || this.matchesName(query);
    };
    
    PromenadeDirectMessageEndpoint.prototype.getMessageId = function () {
        return this.protocol.getMessageId();
    };
    
    PromenadeDirectMessageEndpoint.prototype.generateTopics = function (message_type) {
        return {
            'to_device': this.device_id,
            'to_system': this.system_id,
            'to': this.id,
            'message_type': this.message_types.find(function (type) {
                return message_type === type[0];
            })[1]
        };
    };
    
    PromenadeDirectMessageEndpoint.prototype.generateCommand = function (command) {
        return {
            "command": parseInt(this.commands.find(function (item) {
                            return item.command === command.name;
                        }).id, 10),
            'message_info': command.message_info === null ? 0 : command.message_info,
            "payload": {
                "type": this.data_types.find(function (type) {
                            return command.data_buffer_type === type[0];
                        })[1],
                "data": command.data_buffer === null ? [] : command.data_buffer
            }
        };
    };
    
    PromenadeDirectMessageEndpoint.prototype.generateCommandResponse = function (command) {
        return {
            "status": command.status
        };
    };
    
    PromenadeDirectMessageEndpoint.prototype.generateSystemEvent = function (command) {
        return {
            "event": command.event
        };
    };
    
    PromenadeDirectMessageEndpoint.prototype.generateGenericMessage = function (command) {
        return {};
    };
    
    PromenadeDirectMessageEndpoint.prototype.generateContents = function (message) {
        if (message.message_type === 'COMMAND') return this.generateCommand(message);
        else if (message.message_type === 'COMMAND_RESPONSE') return this.generateCommandResponse(message);
        else if (message.message_type === 'SYSTEM_EVENT') return this.generateSystemEvent(message);
        else return this.generateGenericMessage(message);
    };
    
    PromenadeDirectMessageEndpoint.prototype.generateMessage = function (message) {
        return {
            'topics': this.generateTopics(message.message_type),
            'contents': this.generateContents(message)
        };
    };
    
    PromenadeDirectMessageEndpoint.prototype.sendMessage = function (command) {
        return this.protocol.sendCommand(this.generateMessage(command));
    };

    return PromenadeDirectMessageEndpoint;
        
}]);

direct_message_endpoints.controller('PromenadeDirectMessageEndpointCardLogController', ['$scope', function ($scope) {
    
    $scope.getLog = function () {
        return $scope.endpoint.log;
    };
    
}]);

direct_message_endpoints.controller('PromenadeDirectMessageEndpointCommandController', ['$scope', '$timeout', function ($scope, $timeout) {
    
    $scope.message_type = 'COMMAND';
    $scope.message_info = null;
    $scope.data_buffer_type = null;
    $scope.data_buffer = null;
    $scope.command_name = null;
    
    $scope.buffer_help = null;
    $scope.info_help = null;

    $scope.sending = false;
    $scope.send_button_text = 'Send';
    
    $scope.selectMessageType = function (type) {
        $scope.message_type = type;
    };
    
    $scope.selectCommand = function (command_name) {
        $scope.command_name = command_name;
        
        var command = $scope.endpoint.commands.find(function (command) {
            return command.name === command_name;
        });
        
        $scope.data_buffer_type = command.data_type;
        
        $scope.buffer_help = command.buffer_help === undefined || command.buffer_help === '' ? null : command.buffer_help;
        $scope.info_help = command.info_help === undefined || command.info_help === '' ? null : command.info_help;
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
            $scope.send_button_text = 'Sent! [' + $scope.endpoint.getMessageId() + ']';
            $timeout(function () {
                $scope.send_button_text = 'Send';
            }, 1000);
            $scope.sending = false;
        }).catch(function (response) {
            console.warn(response);
        });
    };
    
}]);

direct_message_endpoints.directive('promenadeDirectMessageEndpointCardCommands', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-direct-message-endpoint-card-commands.html',
        controller: 'PromenadeDirectMessageEndpointCommandController'
    };
});

direct_message_endpoints.directive('promenadeDirectMessageEndpointCardToolbar', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-direct-message-endpoint-card-toolbar.html'
    };
});

direct_message_endpoints.directive('promenadeDirectMessageEndpointCardLog', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-direct-message-endpoint-card-log.html',
        controller: 'PromenadeDirectMessageEndpointCardLogController'
    };
});