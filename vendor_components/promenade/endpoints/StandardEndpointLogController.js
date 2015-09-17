var standard_endpoint_log = angular.module('promenade.endpoints.standardendpoint.log', ['parlay.utility', 'parlay.store.persistence', 'luegg.directives']);

standard_endpoint_log.controller('PromenadeStandardEndpointCardLogController', ['$scope', 'ParlayPersistence', 'ParlayUtility', function ($scope, ParlayPersistence, ParlayUtility) {
    
    $scope.filter_text = null;
    
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
    
    var container = ParlayUtility.relevantScope($scope, 'container').container;
	var directive_name = 'parlayEndpointCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;
    
    ParlayPersistence.monitor(directive_name, "filter_text", $scope);
    
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