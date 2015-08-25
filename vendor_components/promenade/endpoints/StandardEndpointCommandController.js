function relevantScope(currentScope, attribute) {
    return currentScope.hasOwnProperty(attribute) ? currentScope : currentScope.hasOwnProperty('$parent') && currentScope.$parent !== null ? relevantScope(currentScope.$parent, attribute) : undefined;
}

var standard_endpoint_commands = angular.module('promenade.endpoints.standardendpoint.commands', ['RecursionHelper', 'parlay.store']);

standard_endpoint_commands.controller('PromenadeStandardEndpointCommandController', ['$scope', '$timeout', 'ParlayStore', function ($scope, $timeout, ParlayStore) {
    
    $scope.error = false;
    $scope.sending = false;
    $scope.status_message = null;
    
    $scope.message = {};
    
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
		    
		    if (angular.isArray($scope.message[field])) accumulator[param_name] = field_type === 'NUMBERS' ? $scope.message[field].map(parseFloat) : $scope.message[field];
		    else if (angular.isObject($scope.message[field])) accumulator[param_name] = $scope.message[field].value;
            else accumulator[param_name] = $scope.message[field];
            
	        return accumulator;
        }, {});
    }
    
    $scope.send = function (event) {
	    $scope.error = false;
	    if (event) pushChipBuffer(event.target.querySelectorAll('md-chips'));
	    
        $scope.sending = true;
        $scope.endpoint.sendMessage(collectMessage()).then(function (response) {
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
    };
    
    // Contains $scope.$watch registrations.
    var messageWatchers = {};
    
     // Records the directive's attribute to the ParlayStore.
    function setAttribute(directive, attribute, value) {
	    var form_container = ParlayStore('endpoints').get(directive, 'commandform');
	    if (form_container === undefined) form_container = {};
	    form_container[attribute] = value;
	    ParlayStore('endpoints').set(directive, 'commandform', form_container);
    }
    
    // Returns a function that will automatically update the attribute being watched.
    function watchValue(input_name) {
	    return function(newValue, oldValue) {
		    
		    var value = newValue !== null && newValue !== undefined && newValue.value !== undefined ? newValue.value : newValue;
		    
			var container = relevantScope($scope, 'container').container;
		    var key = 'parlayEndpointCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;
		    setAttribute(key, input_name, value);
	    };
    }
    
    // Registers a watch for the specified field.
    function registerWatch(name, field) {
	    if (messageWatchers[name]) messageWatchers[name]();
	    messageWatchers[name] = Array.isArray(field) ? $scope.$watchCollection(function () {
		    return field;
	    }, watchValue(name)) : $scope.$watch(function () {
		    return field;
	    }, watchValue(name));
    }
    
    // Creates watch registration for each field available in the message.
    function setupWatchers(message) {
	    for (var field in message) registerWatch(field, message[field]);
    }
    
    // Calls watch deregistration function for each watcher that we previously registered.
    function clearWatchers() {
	    for (var watcher in messageWatchers) messageWatchers[watcher]();
    }
    
    $scope.$watchCollection('message', function (newValue, oldValue) {
	   	// When $scope.message is changed we will clear all watchers and then setup new watchers on the newValue.
	    clearWatchers();
	    setupWatchers(newValue);
    });
    
    $scope.$on('$destroy', clearWatchers);
    
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


standard_endpoint_commands.directive('promenadeStandardEndpointCardCommandContainer', ['RecursionHelper', 'ParlayStore', function (RecursionHelper, ParlayStore) {
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
	        
	        /**
		     * Retrieves the value that was saved from a previous session for a endpoint's commandform attribute.
		     * @param {String} field_name - Name of the field we are looking to restore from the previous commandform.
		     * @returns {Array|Object|Number|String} - previously saved value.
		     */
	        function getSavedValue(field_name) {
		        // Locate the container property on this scope or from it's parent scopes.
		        var container = relevantScope($scope, 'container').container;
		        // Retrieve the previously saved commandform for this endpoint from the 'endpoints' ParlayStore.
		        var saved_endpoint = ParlayStore('endpoints').get('parlayEndpointCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid, 'commandform');
		        // If we have found the saved endpoint and the requested property we can return it, otherwise return undefined.
		        return saved_endpoint !== undefined && saved_endpoint.hasOwnProperty(field_name) ? saved_endpoint[field_name] : undefined;
	        }
	        
	        /**
		     * Sets the given field back to the state retrieved from the previous session.
		     * @param {String} field - name of the field to restore.
		     */
	        function restoreFieldState(field) {
		        // Retrieve the value from the previous session, if it is undefined or null then return instead of attempting to restore. 
		        var saved = getSavedValue(field.msg_key + '_' + field.input);
		        
		        if (saved !== undefined) {
			     	// Locate the message and fields properties on this scope or from it's parent scopes.
			        var message = relevantScope($scope, 'message').message;
			        var fields = relevantScope($scope, 'fields').fields;
			        
			        // If the saved value is an Array we should set the value.
			        if (Array.isArray(saved)) {
					     message[field.msg_key + '_' + field.input] = saved;   
			        }
			        // If the field is a dropdown and has options present we should use the saved value as a key to access the option saved.
			        else if (fields[field.msg_key].hasOwnProperty('options') && fields[field.msg_key].options.hasOwnProperty(saved)) {
				        message[field.msg_key + '_' + field.input] = fields[field.msg_key].options[saved];
			        }
			        // Otherwise just set the value to the saved value.
			        else {
				        message[field.msg_key + '_' + field.input] = saved;
			        }
			    	   
		        }
		        
	        }
	        
	        function restoreFormState() {
				if ($scope.fields) {
					if (Array.isArray($scope.fields)) $scope.fields.forEach(restoreFieldState);
			        else Object.keys($scope.fields).map(function (field_name) {
						return $scope.fields[field_name];
			        }).forEach(restoreFieldState);	
				}
	        }
	        
	        $scope.hasSubFields = function (field) {
		        var message_field = $scope.message[field.msg_key + '_' + field.input];
		        return message_field !== undefined && message_field !== null && message_field.sub_fields !== undefined;
	        };
	        
	        $scope.getSubFields = function (field) {
		        return $scope.message[field.msg_key + '_' + field.input].sub_fields;
	        };
	        
            var one_time_watch = $scope.$watchCollection('fields', function (newV, oldV, scope) {
	            for (var field in newV) {
                    // If we have not restored a value from a previous workspace session we should set it to the default value.
                    if ($scope.message[newV[field].msg_key + '_' + newV[field].input] === undefined) {
	                	$scope.message[newV[field].msg_key + '_' + newV[field].input] = newV[field].default;    
                    }                    
                    if (!$scope.message[newV[field].msg_key + '_' + newV[field].input] && (newV[field].input === 'NUMBERS' || newV[field].input === 'STRINGS' || newV[field].input === 'ARRAY')) {
                        $scope.message[newV[field].msg_key + '_' + newV[field].input] = [];
                    }
                }
                one_time_watch();
                restoreFormState();
            });
            
        }
    };
}]);