var standard_endpoint = angular.module('promenade.endpoints.standardendpoint', ['parlay.endpoints', 'RecursionHelper']);

standard_endpoint.factory('PromenadeStandardEndpoint', ['ParlayEndpoint', function (ParlayEndpoint) {
    
    function PromenadeStandardEndpoint(data, protocol) {
        ParlayEndpoint.call(this, data, protocol);
        
        Object.defineProperty(this, 'id', {
            value: data.ID,
            configurable: false,
            writeable: false,
            enumerable: true
        });
        
        this.type = 'StandardEndpoint';
        
        this.directives.toolbar.push('promenadeStandardEndpointCardToolbar');
        this.directives.tabs.push('promenadeStandardEndpointCardLog', 'promenadeStandardEndpointCardCommands');
          
        if (data.CONTENT_FIELDS) {
        
            var parseField = (function parseField(field) {
                var fieldObject = {
                    msg_key: field.MSG_KEY,
                    input: field.INPUT,
                    label: field.LABEL !== undefined ? field.LABEL : field.MSG_KEY,
                    required: field.REQUIRED !== undefined ? field.REQUIRED : false,
                    default: field.DEFAULT !== undefined ? field.DEFAULT : undefined,
                    hidden: field.HIDDEN !== undefined ? field.HIDDEN : false
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
    
    PromenadeStandardEndpoint.prototype = Object.create(ParlayEndpoint.prototype);
    
    Object.defineProperty(PromenadeStandardEndpoint.prototype, 'commands', {
        get: function () {
            return this.content_fields.command;
        }
    });
    
    Object.defineProperty(PromenadeStandardEndpoint.prototype, 'message_types', {
        get: function () {
            return this.content_fields.message_type;
        }
    });
    
    Object.defineProperty(PromenadeStandardEndpoint.prototype, 'data_types', {
        get: function () {
            return this.protocol.data_types;
        }
    });
    
    Object.defineProperty(PromenadeStandardEndpoint.prototype, 'log', {
       get: function () {
           return this.protocol.getLog().filter(function (message) {
                return message.topics.FROM === this.id;
            }, this);
       } 
    });
    
    PromenadeStandardEndpoint.prototype.matchesId = function (query) {
        return this.id === query;
    };
    
    PromenadeStandardEndpoint.prototype.matchesType = function (query) {
        return angular.lowercase(this.getType()).indexOf(query) > -1;
    };
    
    PromenadeStandardEndpoint.prototype.matchesName = function (query) {
        return angular.lowercase(this.name).indexOf(query) > -1;
    };
    
    PromenadeStandardEndpoint.prototype.matchesQuery = function (query) {
        var lowercase_query = angular.lowercase(query);
        return this.matchesType(lowercase_query) || this.matchesId(lowercase_query) || this.matchesName(lowercase_query);
    };
    
    PromenadeStandardEndpoint.prototype.getMessageId = function () {
        return this.protocol.getMessageId();
    };
    
    PromenadeStandardEndpoint.prototype.generateTopics = function () {
        return {
            TO: this.id,
            MSG_TYPE: 'COMMAND'
        };
    };
    
    PromenadeStandardEndpoint.prototype.generateContents = function (message) {
        
        var contents = {
            COMMAND: message.command
        };
        
        Object.keys(message).forEach(function (key) {
            if (!contents.hasOwnProperty(key.toUpperCase())) {
                contents[key] = message[key];
            }
        });
        
        return contents;
    };
    
    PromenadeStandardEndpoint.prototype.generateMessage = function (message) {
        return {
            'topics': this.generateTopics(),
            'contents': this.generateContents(message)
        };
    };
    
    PromenadeStandardEndpoint.prototype.sendMessage = function (message) {
        return this.protocol.sendCommand(this.generateMessage(message));
    };

    return PromenadeStandardEndpoint;
        
}]);

standard_endpoint.controller('PromenadeStandardEndpointCardLogController', ['$scope', function ($scope) {
    
    $scope.getLog = function () {
        return $scope.endpoint.log;
    };
    
}]);

standard_endpoint.controller('PromenadeStandardEndpointCommandController', ['$scope', '$timeout', function ($scope, $timeout) {
    
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

standard_endpoint.directive('promenadeStandardEndpointCardCommands', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-commands.html',
        controller: 'PromenadeStandardEndpointCommandController'
    };
});

standard_endpoint.directive('promenadeStandardEndpointCardToolbar', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-toolbar.html'
    };
});

standard_endpoint.directive('promenadeStandardEndpointCardLog', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-log.html',
        controller: 'PromenadeStandardEndpointCardLogController'
    };
});

standard_endpoint.directive('promenadeStandardEndpointCardCommandContainer', ['RecursionHelper', function (RecursionHelper) {
    return {
        scope: {
            message: "=",
            fields: "=",
            commandform: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-command-container.html',
        compile: function (element) {
            return RecursionHelper.compile(element);
        },
        controller: function ($scope) {
            $scope.$watchCollection('fields', function (newV, oldV, $scope) {
                for (var field in newV) {
                    $scope.message[newV[field].msg_key] = newV[field].default;
                }                 
            });
        }
    };
}]);