var standard_endpoint_log = angular.module('promenade.endpoints.standardendpoint.log', []);

standard_endpoint_log.controller('PromenadeStandardEndpointCardLogController', ['$scope', function ($scope) {
    
    $scope.getFilteredLog = function (query) {
	    var lower_case_query = angular.lowercase(query);
	    return query ? $scope.endpoint.log.filter(function (message) {
		    return Object.keys(message.TOPICS).some(function (key) {
			    return angular.lowercase(message.TOPICS[key].toString()).indexOf(lower_case_query) > -1;
		    }) || Object.keys(message.CONTENTS).some(function (key) {
			    return angular.lowercase(message.CONTENTS[key].toString()).indexOf(lower_case_query) > -1;
		    });
	    }) : $scope.endpoint.log;
    };
    
    $scope.getLog = function () {
        return $scope.endpoint.log;
    };
    
}]);

standard_endpoint_log.directive('promenadeStandardEndpointCardLog', function () {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-log.html',
        controller: 'PromenadeStandardEndpointCardLogController'
    };
});