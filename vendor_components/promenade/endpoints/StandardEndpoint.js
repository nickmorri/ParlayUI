/**
 * Formats and parses a given field. Recursively parses dropdown options fields.
 * @param {Object} field - Field object to be parsed.
 * @returns {Object} - Parsed and formatted field Object.
 */
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
    
    /**
	 * PromenadeStandardEndpoint constructor.
	 * Prototypically inherits from ParlayEndpoint.
	 * @constructor
	 */
    function PromenadeStandardEndpoint(data, protocol) {
	    // Call our parent constructor first.
        ParlayEndpoint.call(this, data, protocol);
        
        this.type = "StandardEndpoint";
        
        this.id = data.ID;
        
	    Object.defineProperty(this, 'data_types', {
	        get: function () { return protocol.data_types; }
	    });
	    
	    Object.defineProperty(this, 'log', {
		    get: function () {
			    return protocol.getLog().filter(function (message) {
				    return message.TOPICS.FROM === this.id;
				}, this);
			} 
	    });
        
        // Adds all available PromenadeEndpointCard tabs.
        this.addAvailableDirectives("tabs", [
        	"promenadeStandardEndpointCardCommands",
        	"promenadeStandardEndpointCardLog",
        	"promenadeStandardEndpointCardGraph",
        	"promenadeStandardEndpointCardProperty"
        ]);
        
        this.addDefaultDirectives("tabs", ["promenadeStandardEndpointCardCommands"]);
        this.addDefaultDirectives("toolbar", ["promenadeStandardEndpointCardToolbar"]);
	    
        if (data.CONTENT_FIELDS) {        
            this.content_fields = data.CONTENT_FIELDS.reduce(function (accumulator, field) {
                var parsed_field = parseField(field);
                accumulator[parsed_field.label] = parsed_field;
                return accumulator;
            }, {});
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
    
    /**
	 * Checks if query equals id.
	 * @param {String} query - User inputted query.
	 * @returns {Boolean} - True if match, false otherwise.
	 */
    PromenadeStandardEndpoint.prototype.matchesId = function (query) {
        return this.id === query;
    };
    
    /**
	 * Checks if query matches type.
	 * @param {String} query - User inputted query.
	 * @returns {Boolean} - True if partial or full match, false otherwise.
	 */
    PromenadeStandardEndpoint.prototype.matchesType = function (query) {
        return angular.lowercase(this.getType()).indexOf(query) > -1;
    };
    
    /**
	 * Checks if query matches name.
	 * @param {String} query - User inputted query.
	 * @returns {Boolean} - True if partial or full match, false otherwise.
	 */
    PromenadeStandardEndpoint.prototype.matchesName = function (query) {
        return angular.lowercase(this.name).indexOf(query) > -1;
    };
    
    /**
	 * Checks if endpoint has properties that match query.
	 * @param {String} query - User inputted query.
	 * @returns {Boolean} - True if partial or full match, false otherwise.
	 */
    PromenadeStandardEndpoint.prototype.matchesQuery = function (query) {
        var lowercase_query = angular.lowercase(query);
        return this.matchesName(lowercase_query) || this.matchesType(lowercase_query) || this.matchesId(lowercase_query);
    };
    
    /**
	 * Returns message ID from the endpoint's protocol.
	 * @returns {Number} - current message ID.
	 */
    PromenadeStandardEndpoint.prototype.getMessageId = function () {
        return this.protocol.getMessageId();
    };
    
    /**
	 * Generates topics object for the endpoint.
	 * @returns {Object} - Map of key/value pairs.
	 */
    PromenadeStandardEndpoint.prototype.generateTopics = function () {
        return {
            TO: this.id,
            MSG_TYPE: "COMMAND"
        };
    };
    
    /**
	 * Sends message using the endpoint's protocol.
	 * @param {Object} contents - Map of key/value pairs.
	 * @returns {$q.defer.Promise} - Resolved when message response received.
	 */
    PromenadeStandardEndpoint.prototype.sendMessage = function (contents) {
        return this.protocol.sendMessage(this.generateTopics(), contents);
    };
    
    /**
	 * Returns function that updates the given stream with the value from the response.
	 * @param {Object} stream - Data stream object.
	 * @returns {Function} - Function described below.
	 */
    PromenadeStandardEndpoint.prototype.buildStreamUpdater = function (stream) {
	    /**
		 * Updates the stream object in the closure scope with value from response.
		 * @param {Object} response - stream response that contains value.
		 */
	    return function streamUpdater(response) {
		    this.data_streams[stream.NAME].value = response.VALUE;
	    }.bind(this);
    };
    
    /**
	 * Sends message requesting a data stream. 
	 * Then sets up a onMessage listener to update the data stream object.
	 * @param {Object} stream - Data stream object.
	 * @returns {$q.defer.Promise} - Resolved when we receive stream response.
	 */
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
    
    /**
	 * Sends message canceling a data stream.
	 * Then removes the onMessage listener that may have been setup during stream request.
	 * @param {Object} stream - Data stream object.
	 * @returns {$q.defer.Promise} - Resolved when we receive stream cancelation response.
	 */
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
		}).then(function () {
			this.data_streams[stream.NAME].enabled = false;
			if (this.data_streams[stream.NAME].listener) {
				this.data_streams[stream.NAME].listener();
				this.data_streams[stream.NAME].listener = undefined;
			}		    
		    this.data_streams[stream.NAME].value = undefined;
	    }.bind(this));
    };
    
    /**
	 * Sends message requesting to get a property.
	 * Then updates the value of the property stored on the endpoint.
	 * @param {Object} property - Property object.
	 * @returns {$q.defer.Promise} - Resolved when we receive a response with property value.
	 */
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
    
    /**
	 * Sends message requesting to set a property.
	 * @param {Object} property - Property object.
	 * @returns {$q.defer.Promise} - Resolved when we receive a response with confirmation of property set.
	 */
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
        templateUrl: "../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-toolbar.html"
    };
}

angular.module("promenade.endpoints.standardendpoint", ["parlay.endpoints", "promenade.endpoints.standardendpoint.commands", "promenade.endpoints.standardendpoint.log", "promenade.endpoints.standardendpoint.graph", "promenade.endpoints.standardendpoint.property", "ngOrderObjectBy"])
	.factory("PromenadeStandardEndpoint", ["ParlayEndpoint", PromenadeStandardEndpointFactory])
	.directive("promenadeStandardEndpointCardToolbar", PromenadeStandardEndpointCardToolbar);