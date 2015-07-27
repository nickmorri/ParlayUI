var direct_message_endpoints = angular.module('promenade.endpoints.directmessage', ['parlay.endpoints', 'RecursionHelper']);

direct_message_endpoints.factory('PromenadeDirectMessageEndpoint', ['ParlayEndpoint', function (ParlayEndpoint) {
    
    function PromenadeDirectMessageEndpoint(data, protocol) {
        ParlayEndpoint.call(this, data, protocol);
        
        Object.defineProperty(this, 'id', {
            value: data.ID,
            configurable: false,
            writeable: false,
            enumerable: true
        });
        
        this.type = 'DirectMessageEndpoint';
        
        this.directives.toolbar.push('promenadeDirectMessageEndpointCardToolbar');
        this.directives.tabs.push('promenadeDirectMessageEndpointCardLog', 'promenadeDirectMessageEndpointCardCommands');
          
        if (data.CONTENT_FIELDS) {
        
            var parseField = (function parseField(field) {
                var fieldObject = {
                    msg_key: field.MSG_KEY,
                    input: field.INPUT,
                    label: field.LABEL !== undefined ? field.LABEL : field.MSG_KEY
                };
                
                if (field.DROPDOWN_OPTIONS !== undefined) {
                    
                    if (typeof field.DROPDOWN_OPTIONS[0] === 'string') {
                        fieldObject.options = field.DROPDOWN_OPTIONS;
                    }
                    
                    else if (Array.isArray(field.DROPDOWN_OPTIONS[0])) {
                        fieldObject.options = field.DROPDOWN_OPTIONS.reduce(function (accumulator, enumeration, index) {                        
                            accumulator[enumeration[0]] = {
                                value: enumeration[1],
                                sub_fields: field.DROPDOWN_SUB_FIELDS !== undefined ? field.DROPDOWN_SUB_FIELDS[index].map(parseField) : undefined
                            };                            
                            return accumulator;
                        }, {});    
                    }
                    
                }
                
                return fieldObject;
            });
            
            Object.defineProperty(this, 'content_fields', {
                value: data.CONTENT_FIELDS.reduce(function (accumulator, field) {
                    var parsed_field = parseField(field);
                    accumulator[parsed_field.label] = parsed_field;
                    return accumulator;
                }, {}),
                configurable: false,
                enumerable: false
            });
            
        }
        
    }
    
    PromenadeDirectMessageEndpoint.prototype = Object.create(ParlayEndpoint.prototype);
    
    Object.defineProperty(PromenadeDirectMessageEndpoint.prototype, 'commands', {
        get: function () {
            return this.content_fields.command;
        }
    });
    
    Object.defineProperty(PromenadeDirectMessageEndpoint.prototype, 'message_types', {
        get: function () {
            return this.content_fields.message_type;
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
    
    PromenadeDirectMessageEndpoint.prototype.matchesId = function (query) {
        return this.id === query;
    };
    
    PromenadeDirectMessageEndpoint.prototype.matchesType = function (query) {
        return angular.lowercase(this.getType()).indexOf(query) > -1;
    };
    
    PromenadeDirectMessageEndpoint.prototype.matchesName = function (query) {
        return angular.lowercase(this.name).indexOf(query) > -1;
    };
    
    PromenadeDirectMessageEndpoint.prototype.matchesQuery = function (query) {
        return this.matchesType(query) || this.matchesId(query) || this.matchesName(query);
    };
    
    PromenadeDirectMessageEndpoint.prototype.getMessageId = function () {
        return this.protocol.getMessageId();
    };
    
    PromenadeDirectMessageEndpoint.prototype.generateTopics = function () {
        return {
            'to_device': this.device_id,
            'to_system': this.system_id,
            'to': this.id
        };
    };
    
    PromenadeDirectMessageEndpoint.prototype.generateContents = function (message) {
        return undefined;
    };
    
    PromenadeDirectMessageEndpoint.prototype.generateMessage = function (message) {
        return {
            'topics': this.generateTopics(),
            'contents': this.generateContents(message)
        };
    };
    
    PromenadeDirectMessageEndpoint.prototype.sendMessage = function (message) {
        return this.protocol.sendCommand(this.generateMessage(message));
    };

    return PromenadeDirectMessageEndpoint;
        
}]);

direct_message_endpoints.controller('PromenadeDirectMessageEndpointCardLogController', ['$scope', function ($scope) {
    
    $scope.getLog = function () {
        return $scope.endpoint.log;
    };
    
}]);

direct_message_endpoints.controller('PromenadeDirectMessageEndpointCommandController', ['$scope', '$timeout', function ($scope, $timeout) {
    
    $scope.sending = false;
    $scope.message = {};
    
    function collectMessage () {
        
        var extracted_message = {};
        
        for (var field in $scope.message) {
            if (angular.isObject($scope.message[field])) extracted_message[field] = $scope.message[field].value;
            else extracted_message[field] = $scope.message[field];
        }
        
        return extracted_message;
        
    }
    
    $scope.send = function () {
        $scope.sending = true;
        $scope.endpoint.sendMessage(collectMessage()).then(function (response) {
            $timeout(function () {
                $scope.sending = false;
            }, 500);            
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

direct_message_endpoints.directive('promenadeDirectMessageEndpointCardCommandContainer', ['RecursionHelper', function (RecursionHelper) {
    return {
        scope: {
            message: "=",
            fields: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-direct-message-endpoint-card-command-container.html',
        compile: function (element) {
            return RecursionHelper.compile(element);
        }
    };
}]);