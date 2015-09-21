var standard_endpoint_graph = angular.module('promenade.endpoints.standardendpoint.graph', []);

function setSize(canvas) {
	// Have canvas fill parent.
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

standard_endpoint_graph.directive('promenadeStandardEndpointCardGraph', ['$interval', function ($interval) {
    return {
        scope: {
            endpoint: "="
        },
        templateUrl: '../vendor_components/promenade/endpoints/directives/promenade-standard-endpoint-card-graph.html',
        link: function (scope, element, attributes) {
	        scope.data = 50;
	        $interval(function () {
		        scope.data = Math.floor(Math.random() > 0.5 ? scope.data + 100 : scope.data - 100);
	        }, 1000);
        }
    };
}]);

standard_endpoint_graph.directive('smoothieChart', ['$window', function ($window) {
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
			
			setSize(canvas);
	        
	        scope.smoothie = new SmoothieChart({
		        grid: {
			        fillStyle: 'transparent',
			        strokeStyle: 'transparent',
			        borderVisible: false
			    },
			    labels: {
				    fillStyle: '#000000',
				    fontSize: 12
				}
			});
			
	        scope.smoothie.streamTo(canvas, 1000);
	        
	        var line = new TimeSeries();
    		    
		    scope.smoothie.addTimeSeries(line, {
			    strokeStyle: '#000000',
			    lineWidth: 2
			});
		    
		    // Monitor value on the scope and append it to the SmoothieChart TimeSeries whenever it changes.
		    scope.$watch("value", function (newValue, oldValue, scope) {
			   line.append(new Date().getTime(), newValue);
		    });
		    
		    // If the window resizes we are going to need to resize our graphs as well.
		    // They will not automatically resize otherwise.
		    angular.element($window).bind("resize", function () {
			    setSize(canvas);
		    });
		}
	};
}]);