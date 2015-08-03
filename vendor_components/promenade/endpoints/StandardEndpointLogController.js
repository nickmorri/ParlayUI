var standard_endpoint_log = angular.module('promenade.endpoints.standardendpoint.log', []);

standard_endpoint_log.controller('PromenadeStandardEndpointCardLogController', ['$scope', function ($scope) {
    
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