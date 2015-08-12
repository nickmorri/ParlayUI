var standard_endpoint_commands = angular.module('promenade.endpoints.standardendpoint.commands', ['RecursionHelper', 'parlay.store']);

standard_endpoint_commands.controller('PromenadeStandardEndpointCommandController', ['$scope', '$timeout', 'ParlayLocalStore', function ($scope, $timeout, ParlayLocalStore) {
    
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
        
        var extracted_message = {};
        
        for (var field in $scope.message) {
            var param_name, field_type ;
            if (field.indexOf('_') > -1) {
                var split_field = field.split('_');

                field_type = split_field[split_field.length - 1];

                param_name = split_field.slice(0, split_field.length - 1).join('_');
            }
            else {
                param_name = field;
            }

            if (angular.isArray($scope.message[field])) extracted_message[param_name] = field_type === 'NUMBERS' ? $scope.message[field].map(parseFloat) : $scope.message[field];
            else if (angular.isObject($scope.message[field])) extracted_message[param_name] = $scope.message[field].value;
            else extracted_message[param_name] = $scope.message[field];
        }
        
        return extracted_message;
        
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
    
    var messageWatchers = {};
    
    $scope.$watchCollection('message', function (newValue, oldValue) {
	    
	    function setAttribute(directive, attribute, value) {
		    var form_container = ParlayLocalStore.get(directive, 'commandform');
		    if (form_container === undefined) form_container = {};
		    form_container[attribute] = value;
		    ParlayLocalStore.set(directive, 'commandform', form_container);
	    }
	    
	    function watchValue(input_name) {
		    return function(newValue, oldValue) {
			    var value = newValue !== null && newValue !== undefined && newValue.value !== undefined ? {
				    value: newValue.value
			    } : newValue;
				var container = $scope.$parent.container;
			    var key = 'parlayEndpointCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;
			    setAttribute(key, input_name, value);
		    };
	    }
	    
	    function registerWatch(name, field) {
		    if (messageWatchers[name]) messageWatchers[name]();
		    messageWatchers[name] = Array.isArray(field) ? $scope.$watchCollection(function () {
			    return field;
		    }, watchValue(name)) : $scope.$watch(function () {
			    return field;
		    }, watchValue(name));
	    }
	    
	    function setupWatchers(message) {
		    for (var field in message) registerWatch(field, message[field]);
	    }
	    
	    function clearWatchers() {
		    for (var watcher in messageWatchers) messageWatchers[watcher]();
	    }
	    
	    clearWatchers();
	    setupWatchers(newValue);
    });
    
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


standard_endpoint_commands.directive('promenadeStandardEndpointCardCommandContainer', ['RecursionHelper', 'ParlayLocalStore', function (RecursionHelper, ParlayLocalStore) {
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
	        
	        function relevantScope(currentScope, attribute) {
		        return currentScope.hasOwnProperty(attribute) ? currentScope : relevantScope(currentScope.$parent, attribute);
	        }
	        
	        function getSavedValue(field_name) {
		        var container = relevantScope($scope, 'container').container;
		        var saved_endpoint = ParlayLocalStore.get('parlayEndpointCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid, 'commandform');
		        return saved_endpoint !== undefined && saved_endpoint.hasOwnProperty(field_name) ? saved_endpoint[field_name] : undefined;
	        }
	        
	        function restoreFieldState(field) {
		        var saved = getSavedValue(field.msg_key + '_' + field.input);		        
		        if (saved === undefined) return;
		        
		        var messageScope = relevantScope($scope, 'message');
		        var fieldScope = relevantScope($scope, 'fields');
		        
		        if (saved !== undefined && saved !== null && saved.value !== undefined) {
			    	messageScope.message[field.msg_key + '_' + field.input] = fieldScope.fields[field.msg_key].options[Object.keys(fieldScope.fields[field.msg_key].options).find(function (option) {
				    	return fieldScope.fields[field.msg_key].options[option].value === saved.value;
			    	})];
		    	}
		    	else messageScope.message[field.msg_key + '_' + field.input] = saved;
	        }
	        
	        function restoreFormState() {
		        if (Array.isArray($scope.fields)) $scope.fields.forEach(restoreFieldState);
		        else Object.keys($scope.fields).map(function (field_name) {
					return $scope.fields[field_name];
		        }).forEach(restoreFieldState);
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
                    if (!$scope.message[newV[field].msg_key + '_' + newV[field].input] && (newV[field].input === 'NUMBERS' || newV[field].input === 'STRINGS')) {
                        $scope.message[newV[field].msg_key + '_' + newV[field].input] = [];
                    }
                }
                one_time_watch();
                restoreFormState();
            });
            
        }
    };
}]);