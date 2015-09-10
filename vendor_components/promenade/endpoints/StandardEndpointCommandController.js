var standard_endpoint_commands = angular.module('promenade.endpoints.standardendpoint.commands', ['RecursionHelper', 'parlay.store', 'parlay.navigation.bottombar', 'parlay.utility']);

standard_endpoint_commands.controller('PromenadeStandardEndpointCommandController', ['$scope', '$timeout', 'ScriptLogger', function ($scope, $timeout, ScriptLogger, ParlayUtility) {

    $scope.error = false;
    $scope.sending = false;
    $scope.status_message = null;
    
    var sending_timeout = null;
    
    function pushChipBuffer (chipElements) {
	    for (var i = 0; i < chipElements.length; i++) {
		    var ctrl = angular.element(chipElements[i].querySelector('input')).scope().$mdChipsCtrl;
		    var buffer = ctrl.getChipBuffer();
		    if (buffer.length) ctrl.appendChip(buffer);
		    ctrl.resetChipBuffer();
	    }
    }
    
    function collectMessage () {
        return Object.keys($scope.message).reduce(function (accumulator, field) {
	        var param_name, field_type;
	        if (field.indexOf('_') > -1) {
		        var split_field = field.split('_');

                field_type = split_field[split_field.length - 1];

                param_name = split_field.slice(0, split_field.length - 1).join('_');
		    }
		    else {
			    param_name = field;
		    }
		    // if type is OBJECT or ARRAY then turn the JSON string into an actual object
            if (field_type === 'OBJECT' || field_type === 'ARRAY') {
                try {
                    accumulator[param_name] = JSON.parse($scope.message[field]);
                }
                catch (e) {
	                $scope.error = true;
	                $scope.status_message = param_name + " is not valid JSON.";
                }
            }
		    else if (angular.isArray($scope.message[field])) accumulator[param_name] = field_type === 'NUMBERS' ? $scope.message[field].map(parseFloat) : $scope.message[field];
		    else if (angular.isObject($scope.message[field])) accumulator[param_name] = $scope.message[field].value;
            else accumulator[param_name] = $scope.message[field];
            
	        return accumulator;
        }, {});

    }
    
    $scope.send = function (event) {
	    $scope.error = false;
	    if (event) pushChipBuffer(event.target.querySelectorAll('md-chips'));
	    
        $scope.sending = true;
        
        var message = collectMessage();
        
        if ($scope.error) {
	        $scope.sending = false;
        }
        else {
	     	$scope.endpoint.sendMessage(message).then(function (response) {
		        $scope.status_message = response.STATUS_NAME;
	            if (sending_timeout !== null) $timeout.cancel(sending_timeout);
	        	sending_timeout = $timeout(function () {
		        	sending_timeout = null;
	                $scope.sending = false;
	            }, 500);
	        }).catch(function (response) {
		        $scope.sending = false;
		        $scope.error = true;
		        $scope.status_message = response.STATUS_NAME;
	        });   
        }

        // Put the Python equivalent command in the log.
        ScriptLogger.logCommand("SendCommand(" + Object.keys(message).map(function (key) {
	        return typeof message[key] === 'number' ? key + "=" + message[key] : key + "='" + message[key] + "'";
        }).join(",") + ")");

    };
    
}]);

standard_endpoint_commands.directive('promenadeStandardEndpointCardCommands', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-commands.html',
        controller: 'PromenadeStandardEndpointCommandController'
    };
});


standard_endpoint_commands.directive('promenadeStandardEndpointCardCommandContainer', ['RecursionHelper', 'ParlayPersistence', function (RecursionHelper, ParlayPersistence) {
    return {
        scope: {
            message: "=",
            fields: "=",
            commandform: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-command-container.html',
        compile: RecursionHelper.compile,
        controller: function ($scope) {

	        // If message doesn't exist yet, we're the top level PromenadeStandardEndpointCardCommandContainer which means we should instantiate it.
	        if ($scope.message === undefined) $scope.message = {};
		    
		    var container = ParlayUtility.relevantScope($scope, 'container').container;
			var directive_name = 'parlayEndpointCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;
		    
		    ParlayPersistence.monitorCollection(directive_name, "message", $scope);
	        
	        /**
		     * Checks if the given field has sub fields available.
		     * @param {Object} field - the field we are interested in.
		     * @returns {Boolean} - true if the target field has sub fields available, false otherwise.
		     */
	        $scope.hasSubFields = function (field) {
		        var message_field = $scope.message[field.msg_key + '_' + field.input];
		        return message_field !== undefined && message_field !== null && message_field.sub_fields !== undefined;
	        };
	        
	        /**
		     * Returns a given field's sub fields.
		     * @param {Object} field - the field we are interested in.
		     * @returns {Object|Array} - the fields sub fields, may be Object or Array.
		     */
	        $scope.getSubFields = function (field) {
		        return $scope.message[field.msg_key + '_' + field.input].sub_fields;
	        };
	        
	        // When fields is created we should first attempt to restore the previous values, if we are unable we will populate with the available default.
			$scope.$watchCollection('fields', function (fields) {
				
				fields = Array.isArray(fields) ? fields : Object.keys(fields).map(function (field) {
					return fields[field];
				});
				
				fields.filter(function (field) {
					// Check if we have already instantiated this message field.
					return !$scope.message.hasOwnProperty(field.msg_key + '_' + field.input);
				}).forEach(function (field) {
					// For every field that has not been restored from it's previous state we will attempt to find it's default.
					if (field.default) $scope.message[field.msg_key + '_' + field.input] = field.default;
			        else if ($scope.message[field.msg_key + '_' + field.input] === undefined && ['NUMBERS', 'STRINGS', 'ARRAY'].indexOf(field.input) > -1) {
			            $scope.message[field.msg_key + '_' + field.input] = [];
			        }
				});
			});
            
        }
    };
}]);