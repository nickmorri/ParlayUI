/**
 * @name promenadeSmoothieChart
 * @restrict E
 *
 * @description
 * The '<promenade-smoothie-chart>' creates a SmoothieChart HTML5 Canvas element for graphing values.
 * 
 * @usage
 * <promenade-smoothie-chart delay="1000" streams="data" config="chart_config" smoothie-fn="getSmoothieConfig"></promenade-smoothie-chart>
 *
 * @param {Object} streams - Contains references to the stream data.
 * {
 *	 line1: {
 *	 	value: 10,
 *		enabled: true,
 *		rate: 5
 * 	 }
 * }
 *
 * @param {Object} config - Contains configuration data. Please reference the SmoothieChart constructor for options. http://smoothiecharts.org/tutorial.html#mycanvas6
 * @param {Number} [delay=1000] delay - Add delay so uncoming values are known before we need to plot the value.
 */
 
 function PromenadeSmoothieChart($window, $interval) {
	 
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
			var colors, canvas, smoothie, lines, resize;
			
			// If scope.delay wasn't provided we should default to 1000.
			if (scope.delay === undefined) scope.delay = 1000;
			
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
		    
		    /**
			 * Return streams that are currently enabled in scope.streams.
			 * @returns {Array} - Array of stream Objects.
			 */
		    function getEnabledStreams() {
			    return Object.keys(scope.streams).map(function (key) {
				    return scope.streams[key];
			    }).filter(function (stream) {
				    return stream.enabled;
			    });
		    }
		    
		    /**
			 * If a Smoothie TimeSeries doesn't exist for an enabled stream we should create it.
			 * @param {Array} streams - Array of enabled streams.
			 */
		    function createTimeSeries(streams) {
			    streams.filter(function (stream) {
				    return !lines[stream.NAME];
				}).forEach(function(stream) {
					lines[stream.NAME] = new TimeSeries();
				    
				    smoothie.addTimeSeries(lines[stream.NAME], {
						strokeStyle: colors.pop(),
					    lineWidth: 2
				    });
				});
		    }
		    
		    /**
			 * If a Smoothie TimeSeries exists for a stream that is not enabled we should remove it.
			 * @param {Array} streams - Array of enabled streams.
			 */
		    function pruneTimeSeries(streams) {
			    Object.keys(lines).filter(function(key) {
				    return !streams.some(function(stream) { return stream.NAME === key; });
			    }).forEach(function (key) {
				    smoothie.removeTimeSeries(lines[key]);
				    delete lines[key];
			    });
		    }
		    
		    /**
			 * Append the current time and value for each enabled stream.
			 * @param {Object} stream - Enabled stream object.
			 */
		    function updateStreamLine(stream) {
			    // Skip appending an undefined stream value.
			    if (stream.value) lines[stream.NAME].append(new Date().getTime(), stream.value);
		    }
		    
		    function updateLines() {
			    // Get an array of currently enabled streams.
			    var enabled_streams = getEnabledStreams();
			    
			    // If the TimeSeries doesn't exist create it.
			    createTimeSeries(enabled_streams);
				
				// Update the TimeSeries with the latest stream value.
				enabled_streams.forEach(updateStreamLine);
			    
			    // If a line is removed we should remove the TimeSeries from the SmoothieChart.
			    pruneTimeSeries(enabled_streams);
		    }
		    
		    // Do an initial update so we don't have to wait a second for the first interval.
		    updateLines();
		    
		    // At at an interval specified by scope.delay ensure that the values available in scope.values are consistent with the SmoothieChart.
		    var update_interval_registration = $interval(updateLines, scope.delay, 0, true);
		    			    
			// When the scope the PromenadeSmoothieChart exists on is destroyed we need to cleanup listeners and remove the canvas element.
		    scope.$on("$destroy", function () {
			    $interval.cancel(update_interval_registration);
			    angular.element($window).off("resize", resize);
			    canvas.parentElement.removeChild(canvas);
			    canvas = null;
		    });
		    			    
		}
	};
}
 
angular.module("promenade.smoothiechart", [])
	.directive('promenadeSmoothieChart', ['$window', "$interval", PromenadeSmoothieChart]);