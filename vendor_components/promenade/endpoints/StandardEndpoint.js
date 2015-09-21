var standard_endpoint = angular.module('promenade.endpoints.standardendpoint', ['parlay.endpoints', 'promenade.endpoints.standardendpoint.commands', 'promenade.endpoints.standardendpoint.log', 'promenade.endpoints.standardendpoint.graph']);

function parseField(field) {
	            
    var fieldObject = {
        msg_key: field.MSG_KEY,
        input: field.INPUT,
        label: field.LABEL !== undefined ? field.LABEL : field.MSG_KEY,
        required: field.REQUIRED !== undefined ? field.REQUIRED : false,
        default: field.DEFAULT !== undefined ? field.DEFAULT : undefined,
        hidden: field.HIDDEN !== undefined ? field.HIDDEN : false
    };
    
    // If a field has dropdown options we should process them.
    if (field.DROPDOWN_OPTIONS !== undefined) {
        
        fieldObject.options = field.DROPDOWN_OPTIONS.map(function (option, index) {
            return typeof option === "string" ? {
                name: option,
                value: option,
                sub_fields: undefined
            } : {
              	name: option[0],
              	value: option[1],
              	sub_fields: field.DROPDOWN_SUB_FIELDS !== undefined ? field.DROPDOWN_SUB_FIELDS[index].map(parseField) : undefined
            };
        });
        
    }
    
    return fieldObject;
}

standard_endpoint.factory('PromenadeStandardEndpoint', ['ParlayEndpoint', function (ParlayEndpoint) {
    
    function PromenadeStandardEndpoint(data, protocol) {
	    // Call our parent constructor first.
        ParlayEndpoint.call(this, data, protocol);
        
        Object.defineProperty(this, 'id', {
            value: data.ID,
            configurable: false,
            writeable: false,
            enumerable: true
        });
        
        this.type = 'StandardEndpoint';
        
        this.directives.toolbar.push('promenadeStandardEndpointCardToolbar');
        this.directives.tabs.push("promenadeStandardEndpointCardCommands", "promenadeStandardEndpointCardLog", "promenadeStandardEndpointCardGraph");
          
        if (data.CONTENT_FIELDS) {
        
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
    
    // Prototypically inherit from ParlayEndpoint.
    PromenadeStandardEndpoint.prototype = Object.create(ParlayEndpoint.prototype);
    
    Object.defineProperty(PromenadeStandardEndpoint.prototype, 'commands', {
        get: function () {
            return this.content_fields.command;
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
                return message.TOPICS.FROM === this.id;
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
        return this.matchesName(lowercase_query) || this.matchesType(lowercase_query) || this.matchesId(lowercase_query);
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
            'TOPICS': this.generateTopics(),
            'CONTENTS': this.generateContents(message)
        };
    };
    
    PromenadeStandardEndpoint.prototype.sendMessage = function (message) {
        return this.protocol.sendCommand(this.generateMessage(message));
    };

    return PromenadeStandardEndpoint;
        
}]);

standard_endpoint.directive('promenadeStandardEndpointCardToolbar', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-toolbar.html'
    };
});