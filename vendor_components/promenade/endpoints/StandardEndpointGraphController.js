var standard_endpoint_graph = angular.module('promenade.endpoints.standardendpoint.graph', ['parlay.utility', 'parlay.store.persistence']);

standard_endpoint_graph.controller('PromenadeStandardEndpointCardGraphController', ['$scope', 'ParlayPersistence', 'ParlayUtility', function ($scope, ParlayPersistence, ParlayUtility) {
       
    var container = ParlayUtility.relevantScope($scope, 'container').container;
	var directive_name = 'parlayEndpointCard.' + container.ref.name.replace(' ', '_') + '_' + container.uid;
	
	$scope.getGraphID = function () {
		return directive_name + "_graph";
	};
    
}]);

standard_endpoint_graph.directive('promenadeStandardEndpointCardGraph', ['$interval', function ($interval) {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-graph.html',
        controller: 'PromenadeStandardEndpointCardGraphController',
        link: function (scope, element, attributes) {
	        scope.data = 50;
	        $interval(function () {
		        scope.data = Math.floor(Math.random() > 0.5 ? scope.data + 100 : scope.data - 100);
	        }, 1000);
        }
    };
}]);

standard_endpoint_graph.directive('smoothieChart', function () {
	return {
		restrict: "E",
		scope: {
			value: '='
		},
		link: function (scope, element, attributes) {
			// Create HTML5 canvas DOM element.
			var canvas = document.createElement("canvas");
			
			// Add it as a child to our directive element.
			element[0].appendChild(canvas);
			
			// Have canvas fill parent.
			canvas.style.width = "100%";
			canvas.style.height = "100%";
			canvas.width = canvas.offsetWidth;
	        canvas.height = canvas.offsetHeight;
	        
	        scope.smoothie = new SmoothieChart();
	        scope.smoothie.streamTo(canvas, 1000);
	        
	        var line = new TimeSeries();
    		    
		    scope.smoothie.addTimeSeries(line, {
			    strokeStyle: 'rgb(0, 255, 0)',
			    lineWidth: 2
			});
		    
		    // Monitor value on the scope and append it to the SmoothieChart TimeSeries whenever it changes.
		    scope.$watch("value", function (newValue, oldValue, scope) {
			   line.append(new Date().getTime(), newValue);
		    });
		}
	};
});