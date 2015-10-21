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

function PromenadeStandardEndpointFactory(ParlayEndpoint) {
    
    function PromenadeStandardEndpoint(data, protocol) {
	    // Call our parent constructor first.
        ParlayEndpoint.call(this, data, protocol);
        
        this.type = 'StandardEndpoint';
        
        Object.defineProperty(this, 'id', {
            value: data.ID,
            configurable: false,
            writeable: false,
            enumerable: true
        });
        
        this.addAvailableDirective({
	        tabs: [
	        	"promenadeStandardEndpointCardCommands",
	        	"promenadeStandardEndpointCardLog",
	        	"promenadeStandardEndpointCardGraph",
	        	"promenadeStandardEndpointCardProperty"
	        ]
        });
        
        this.addDefaultDirective({
	        toolbar: ["promenadeStandardEndpointCardToolbar"],
	        tabs: ["promenadeStandardEndpointCardCommands"]
	    });
          
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
        
        if (data.PROPERTIES) {
	        this.properties = data.PROPERTIES.reduce(function (accumulator, current) {
		        current.value = current.INPUT === "STRINGS" || current.INPUT === "NUMBERS" ? [] : undefined;
		        accumulator[current.NAME] = current;
		        return accumulator;
	        }, {});
        }
        
        if (data.DATASTREAMS) {
	        this.data_streams = data.DATASTREAMS.reduce(function (accumulator, current) {
		        accumulator[current.NAME] = current;
		        accumulator[current.NAME].value = undefined;
		        accumulator[current.NAME].listener = undefined;
		        accumulator[current.NAME].enabled = false;
		        accumulator[current.NAME].rate = 0;
		        return accumulator;
	        }, {});	        
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
        return Object.keys(message).reduce(function (accumulator, key) {
            if (!accumulator.hasOwnProperty(key.toUpperCase())) accumulator[key] = message[key];
            return accumulator;
        }, { COMMAND: message.command });
    };
    
    PromenadeStandardEndpoint.prototype.sendMessage = function (message) {
        return this.protocol.sendMessage(this.generateTopics(), this.generateContents(message));
    };
    
    PromenadeStandardEndpoint.prototype.buildStreamUpdater = function (stream) {
	    return function streamUpdater(response) {
		    this.data_streams[stream.NAME].value = response.VALUE;
	    }.bind(this);
    };
    
    PromenadeStandardEndpoint.prototype.requestStream = function (stream) {
		if (stream.rate < 1) stream.rate = 1;
	    return this.protocol.sendMessage({
		    TX_TYPE: "DIRECT",
		    MSG_TYPE: "STREAM",
		    TO: this.id
		},
		{
			STREAM: stream.NAME,
			RATE: stream.rate,
			VALUE: null
		},
		{
			TX_TYPE: "DIRECT",
			MSG_TYPE: "STREAM",
			TO: "UI",
			FROM: this.id
		}).then(function (response) {
		    this.data_streams[stream.NAME].enabled = true;
		    this.data_streams[stream.NAME].listener = this.protocol.onMessage({
			    TX_TYPE: "DIRECT",
			    MSG_TYPE: "STREAM",
			    TO: "UI",
			    FROM: this.id,
			    STREAM: stream.NAME
		    }, this.buildStreamUpdater(stream));
		    
		    return response;
	    }.bind(this));
    };
    
    PromenadeStandardEndpoint.prototype.cancelStream = function (stream) {
	    stream.rate = 0;
	    return this.protocol.sendMessage({
		    TX_TYPE: "DIRECT",
			MSG_TYPE: "STREAM",
			TO: this.id
		},
		{
			STREAM: stream.NAME,
			RATE: stream.rate,
			VALUE: null
		},
		{
			TX_TYPE: "DIRECT",
			MSG_TYPE: "STREAM",
			TO: "UI",
			FROM: this.id
		}).then(function (response) {
			this.data_streams[stream.NAME].enabled = false;
		    this.data_streams[stream.NAME].listener();
		    this.data_streams[stream.NAME].value = undefined;
	    }.bind(this));
    };
    
    PromenadeStandardEndpoint.prototype.getProperty = function (property) {
	    return this.protocol.sendMessage({
		    TX_TYPE: "DIRECT",
		    MSG_TYPE: "PROPERTY",
		    TO: this.id
		},
		{
			PROPERTY: property.NAME,
			ACTION: "GET",
			VALUE: null
		},
		{
			TX_TYPE: "DIRECT",
			MSG_TYPE: "RESPONSE",
			FROM: this.id,
			TO: "UI"
		}).then(function(response) {
			this.properties[response.PROPERTY].VALUE = response.VALUE;
			return response;
		}.bind(this));
    };
    
    PromenadeStandardEndpoint.prototype.setProperty = function (property) {
	    return this.protocol.sendMessage({
		    TX_TYPE: "DIRECT",
		    MSG_TYPE: "PROPERTY",
		    TO: this.id
		},
		{
			PROPERTY: property.NAME,
			ACTION: "SET",
			VALUE: property.VALUE
	    },
		{
			TX_TYPE: "DIRECT",
			MSG_TYPE: "RESPONSE",
			FROM: this.id,
			TO: "UI"
		}).then(function(response) {
			return response;
		}.bind(this));
    };

    return PromenadeStandardEndpoint;
        
}

function PromenadeStandardEndpointCardToolbar() {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-toolbar.html'
    };
}

angular.module('promenade.endpoints.standardendpoint', ['parlay.endpoints', 'promenade.endpoints.standardendpoint.commands', 'promenade.endpoints.standardendpoint.log', 'promenade.endpoints.standardendpoint.graph', 'promenade.endpoints.standardendpoint.property', 'ngOrderObjectBy'])
	.factory('PromenadeStandardEndpoint', ['ParlayEndpoint', PromenadeStandardEndpointFactory])
	.directive('promenadeStandardEndpointCardToolbar', PromenadeStandardEndpointCardToolbar);