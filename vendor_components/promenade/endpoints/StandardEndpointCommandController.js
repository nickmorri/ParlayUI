var standard_endpoint_commands = angular.module('promenade.endpoints.standardendpoint.commands', ['RecursionHelper', 'parlay.store', 'parlay.navigation.bottombar', 'parlay.utility']);

standard_endpoint_commands.controller('PromenadeStandardEndpointCommandController', ['$scope', '$timeout', 'ScriptLogger', 'ParlayUtility', function ($scope, $timeout, ScriptLogger, ParlayUtility) {

	// We are wrapping message in another object due to the way Angular handles nested scopes. Reference "Angular Dot Rule".
	$scope.wrapper = {
		message: {}
	};

    $scope.error = false;
    $scope.sending = false;
    $scope.status_message = null;
    
    var sending_timeout = null;
    
    /**
	 * If the buffer is valid and available we should force the md-chips controller to push it to the ng-model.
	 * @param {NodeList} chipElements - List of HTMLElements mapping to each md-chip.
	 */
    function pushChipBuffer (chipElements) {
	    if (chipElements.length) {
		    var ctrl = angular.element(chipElements[0].querySelector('input')).scope().$mdChipsCtrl;
		    var buffer = ctrl.getChipBuffer();
		    if (buffer !== "") {
				ctrl.appendChip(buffer);
				ctrl.resetChipBuffer();    
		    }			
		}
    }
    
    /**
	 * Collects and formats the fields available on the given message object.
	 * @param {Object} message - message container from the scope.
	 * @returns - parsed and formatted StandardEndpoint data.
	 */    
    function collectMessage (message) {
        return Object.keys(message).reduce(function (accumulator, field) {
	        var param_name, field_type;
	        
	        if (field.indexOf('_') > -1) {
		        var split_field = field.split('_');

                field_type = split_field[split_field.length - 1];

                param_name = split_field.slice(0, split_field.length - 1).join('_');
		    }
		    else {
			    param_name = field;
		    }
		    
		    // If type is Object or Array then turn the JSON string into an actual Object.
		    if (angular.isArray(message[field])) accumulator[param_name] = field_type === 'NUMBERS' ? message[field].map(parseFloat) : message[field];
		    else if (angular.isObject(message[field])) accumulator[param_name] = message[field].value;
            else accumulator[param_name] = message[field];
            
	        return accumulator;
        }, {});

    }
    
    $scope.send = function (event) {
	    
	    // Push the buffer into the md-chips ng-model
	    pushChipBuffer(event.target.querySelectorAll('md-chips'));
	    
	    $scope.error = false;
        $scope.sending = true;
        
        try {
	    	var message = collectMessage($scope.wrapper.message);
	    	$scope.endpoint.sendMessage(message)
		     	.then(function (response) {
			     	
			     	// Use the response to display feedback on the send button.
			        $scope.status_message = response.STATUS_NAME;
			        
			        // If we still have an outstanding timeout we should cancel it to prevent the send button from flickering.
		            if (sending_timeout !== null) $timeout.cancel(sending_timeout);
		            
		            // Setup a timeout to reset the button to it's default state after a brief period of time.
		        	sending_timeout = $timeout(function () {
			        	sending_timeout = null;
		                $scope.sending = false;
		                $scope.status_message = null;
		            }, 500);
		            
		        }).catch(function (response) {
			        $scope.sending = false;
			        $scope.error = true;
			        $scope.status_message = response.STATUS_NAME;
		        });
		    
		    // Put the Python equivalent command in the log.
	        ScriptLogger.logCommand("SendCommand(" + Object.keys(message).map(function (key) {
		        return typeof message[key] === 'number' ? key + '=' + message[key] : key + "='" + message[key] + "'";
	        }).join(',') + ')');
        }
        catch (e) {
	     	$scope.error = true;
	     	$scope.status_message = e;   
        }

    };
    
    // Watch for new fields to fill with defaults.
    $scope.$watchCollection("wrapper.message", function () {
	    Object.keys($scope.wrapper.message).filter(function (key) {
		    // Build an Array with fields that have sub fields.
		    return $scope.wrapper.message[key] !== undefined && $scope.wrapper.message[key].hasOwnProperty("sub_fields");
	    }).map(function (key) {
	        return $scope.wrapper.message[key].sub_fields;
	    }).reduce(function (accumulator, current) {
		    // Join all the sub_fields into a larger Array.
		    return accumulator.concat(current);
	    }, []).filter(function (field) {
		    // Check if the sub field already has a message field entry.
	        return field !== undefined && !$scope.wrapper.message.hasOwnProperty(field.msg_key + '_' + field.input);
	    }).forEach(function (field) {
		    // Fill in the default value in the message Object.
	        $scope.wrapper.message[field.msg_key + '_' + field.input] = ['NUMBERS', 'STRINGS', 'ARRAY'].indexOf(field.input) > -1 ? [] : field.default;
	    });
    });
    
}]);

standard_endpoint_commands.directive("promenadeStandardEndpointCardCommands", function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: "../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-commands.html",
        controller: "PromenadeStandardEndpointCommandController"
    };
});


standard_endpoint_commands.directive("promenadeStandardEndpointCardCommandContainer", ['RecursionHelper', 'ParlayPersistence', 'ParlayUtility', function (RecursionHelper, ParlayPersistence, ParlayUtility) {
    return {
        scope: {
            wrapper: '=',
            fields: '=',
            commandform: '='
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-command-container.html',
        compile: RecursionHelper.compile,
        controller: function ($scope) {

	        var container = ParlayUtility.relevantScope($scope, 'container').container;
			var directive_name = 'parlayEndpointCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;
		    
		    ParlayPersistence.monitor(directive_name, "wrapper.message", $scope);
	        
	        /**
		     * Checks if the given field has sub fields available.
		     * @param {Object} field - the field we are interested in.
		     * @returns {Boolean} - true if the target field has sub fields available, false otherwise.
		     */
	        $scope.hasSubFields = function (field) {
		        var message_field = $scope.wrapper.message[field.msg_key + '_' + field.input];
		        return message_field !== undefined && message_field !== null && message_field.sub_fields !== undefined;
	        };
	        
	        /**
		     * Returns a given field's sub fields.
		     * @param {Object} field - the field we are interested in.
		     * @returns {Object|Array} - the fields sub fields, may be Object or Array.
		     */
	        $scope.getSubFields = function (field) {
		        return $scope.wrapper.message[field.msg_key + '_' + field.input].sub_fields;
	        };
            
        }
    };
}]);