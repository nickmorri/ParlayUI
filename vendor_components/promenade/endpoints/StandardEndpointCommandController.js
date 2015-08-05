var standard_endpoint_commands = angular.module('promenade.endpoints.standardendpoint.commands', ['RecursionHelper']);

standard_endpoint_commands.controller('PromenadeStandardEndpointCommandController', ['$scope', '$timeout', function ($scope, $timeout) {
    
    $scope.error = false;
    $scope.sending = false;
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
            if (sending_timeout !== null) $timeout.cancel(sending_timeout);
        	sending_timeout = $timeout(function () {
	        	sending_timeout = null;
                $scope.sending = false;
            }, 500);
        }).catch(function (response) {
	        $scope.sending = false;
	        $scope.error = true;
	        $scope.error_message = response.STATUS_NAME;
        });
    };
    
}]);

standard_endpoint_commands.directive('promenadeStandardEndpointCardCommands', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-commands.html',
        controller: 'PromenadeStandardEndpointCommandController',
        link: function (scope, element, attributes) {
	        scope.element = element;
        }
    };
});


standard_endpoint_commands.directive('promenadeStandardEndpointCardCommandContainer', ['RecursionHelper', function (RecursionHelper) {
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
                    $scope.message[newV[field].msg_key + '_' + newV[field].input] = newV[field].default;
                    if (!$scope.message[newV[field].msg_key + '_' + newV[field].input] && (newV[field].input === 'NUMBERS' || newV[field].input === 'STRINGS')) {
                        $scope.message[newV[field].msg_key + '_' + newV[field].input] = [];
                    }
                }                 
            });
        }
    };
}]);