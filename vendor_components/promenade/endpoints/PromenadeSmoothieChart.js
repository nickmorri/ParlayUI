/**
 * @name promenadeSmoothieChart
 * @restrict E
 *
 * @description
 * The '<promenade-smoothie-chart>' creates a SmoothieChart HTML5 Canvas element for graphing values.
 * 
 * @usage
 * <promenade-smoothie-chart lines="data" config="chart_config"></promenade-smoothie-chart>
 *
 * @param {Object} streams - Contains references to the line data.
 * {
 *	 line1: {
 *	 	value: 10,
 *		config: {
 *	 		lineWidth: 2,
 *			strokeStyle: "#000000"
 * 		}
 * 	 }
 * }
 *
 * @param {Object} config - Contains configuration data. Please reference the SmoothieChart constructor for options. http://smoothiecharts.org/tutorial.html#mycanvas6
 * @param {Number} [delay=1000] delay - Add delay so uncoming values are known before we need to plot the value.
 */
 
 function PromenadeSmoothieChart ($window, $interval) {
	 
	/**
	 * Returns Function with canvas element in closure.
	 * @param {canvas} canvas - HTML Canvas element.
	 */
	function setSize(canvas) {
		/**
		 * Fills parent element with SmoothieChart HTML5 Canvas object.
		 */
		return function () {
			canvas.style.width = "100%";
			canvas.style.height = "100%";
			canvas.width = canvas.offsetWidth;
		    canvas.height = canvas.offsetHeight;
		};
	}
	
	return {
		restrict: 'E',
		scope: {
			delay: "=",
			streams: '=',
			config: '=',
			getSmoothie: '=smoothieFn'
		},
		link: function (scope, element, attributes) {
			var colors, canvas, smoothie, lines, resize, minimum, maximum;
			
			// Easy colors to see on most transparent backgrounds.
			colors = ["#000000", "#0433ff", "#aa7942", "#00fdff", "#00f900", "#ff40ff", "#ff9300", "#942192", "#ff2600", "#fffb00"];
			
			// Create HTML5 canvas DOM element.
			canvas = document.createElement("canvas");
			
			// Add it as a child to our directive element.
			element[0].appendChild(canvas);
			
			// Use the configuration from scope if available. Otherwise use the default configuration.
			smoothie = new SmoothieChart(scope.config ? scope.config : {
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
			
			// Attaches SmoothieChart to HTML5 Canvas element. Sets streaming delay to given value if available, otherwise defaults to 1000ms.
			smoothie.streamTo(canvas, scope.delay);
	        
	        // Container for TimeSeries Objects.
	        lines = {};
		    
		    // If the window resizes we are going to need to resize our graphs as well.
		    // They will not automatically resize otherwise.
		    resize = setSize(canvas);
		    // Do initial resizing.
		    resize();
		    // Setup listener on $window resize event.
		    angular.element($window).on("resize", resize);
		    
		    /**
			 * Returns reference to SmoothieChart Object
			 * @returns {SmootheChart} - reference to SmoothieChart Object.
			 */
		    scope.getSmoothie = function () {
			    return smoothie;
		    };
		    
		    // 
		    $interval(function () {			    
			    // Get an array of currently enabled streams.
			    var enabled_streams = Object.keys(scope.streams).map(function (key) {
				    return scope.streams[key];
			    }).filter(function (stream) {
				    return stream.enabled;
			    });
			    
			    // If the TimeSeries doesn't exist create it.
			    enabled_streams.filter(function (stream) {
				    return !lines[stream.NAME];
				}).forEach(function(stream) {
					lines[stream.NAME] = new TimeSeries();
				    
				    smoothie.addTimeSeries(lines[stream.NAME], {
						strokeStyle: colors.pop(),
					    lineWidth: 2
				    });
				});
				
				// Append the current time and value for each enabled stream.
				enabled_streams.forEach(function(stream) {
					lines[stream.NAME].append(new Date().getTime(), stream.value);
				});
			    
			    // If a line is removed we should remove the TimeSeries from the SmoothieChart.
			    Object.keys(lines).filter(function(key) {
				    return !scope.streams[key] || !scope.streams[key].enabled;
			    }).forEach(function (key) {
				    smoothie.removeTimeSeries(lines[key]);
				    delete lines[key];
			    });
			    
			    return true;
		    }, scope.delay, 0, false);
		    			    
		    scope.$on("$destroy", function () {
			    // Remove listener on $window resize when $destroy event is broadcast on scope.
			    angular.element($window).off("resize", resize);
			    canvas.parentElement.removeChild(canvas);
			    canvas = null;
		    });
		    			    
		}
	};
}
 
angular.module("promenade.smoothiechart", [])
	.directive('promenadeSmoothieChart', ['$window', "$interval", PromenadeSmoothieChart]);