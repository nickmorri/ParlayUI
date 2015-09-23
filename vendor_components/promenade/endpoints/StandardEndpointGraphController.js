var standard_endpoint_graph = angular.module('promenade.endpoints.standardendpoint.graph', ["promenade.smoothiechart"]);

standard_endpoint_graph.directive('promenadeStandardEndpointCardGraph', ['$interval', function ($interval) {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-graph.html',
        link: function (scope, element, attributes) {
	        
	        $interval(function () {
		        
		        Object.keys(scope.data).forEach(function (key) {
			        scope.data[key].value = Math.floor(Math.random() > 0.5 ? scope.data[key].value + 100 : scope.data[key].value - 100);
		        });
		        
	        }, 1000);
	        
	        scope.data = {};
	        
	        for (var i = 1; i < 11; i++) {
		        scope.data["line" + i] = {
			      	value: 10 * i,
			      	config: {
				  		lineWidth: 2
			      	}  
		        };
	        }
	        
        }
    };
}]);

