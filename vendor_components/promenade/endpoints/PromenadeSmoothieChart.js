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
 * @param {Object} lines - Contains references to the line data.
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
 
angular.module("promenade.smoothiechart", [])
	.directive('promenadeSmoothieChart', ['$window', function ($window) {
		
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
			restrict: "E",
			scope: {
				lines: '=',
				config: '='
			},
			link: function (scope, element, attributes) {
				var colors, canvas, smoothie, lines, resize;				
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
				smoothie.streamTo(canvas, scope.delay ? scope.delay : 1000);
		        
		        // Container for TimeSeries Objects.
		        lines = {};
		        
			    // Monitor value on the scope and append it to the SmoothieChart TimeSeries whenever it changes.
			    // NOTE: We are using Angular's deep equality $watch here, this may have a performance hit. May want to do some profiling here.
			    scope.$watch("lines", function (newValue, oldValue, scope) {
				    
				    Object.keys(newValue).forEach(function (key) {
					    
					    // If we haven't created a TimeSeries for a line yet we should create it.
					    if (!lines[key]) {
						    lines[key] = new TimeSeries();
						    var config = newValue[key].config;
						    if (!config.strokeStyle && colors.length) config.strokeStyle = colors.pop();
						    if (!config.lineWidth) config.lineWidth = 2;
						    smoothie.addTimeSeries(lines[key], config);
					    }
					    
					    // Add the value to the TimeSeries.
					    lines[key].append(new Date().getTime(), newValue[key].value);
				    });
				    
				    // If a line is removed we should remove the TimeSeries from the SmoothieChart.
				    for (var line in lines) {
					    if (!newValue[line] || !newValue[line].enabled) delete lines[line];
				    }
				    
			    }, true);
			    
			    // If the window resizes we are going to need to resize our graphs as well.
			    // They will not automatically resize otherwise.
			    resize = setSize(canvas);
			    // Do initial resizing.
			    resize();
			    // Setup listener on $window resize event.
			    angular.element($window).on("resize", resize);
			    
			    scope.$on("$destroy", function () {
				    // Remove listener on $window resize when $destroy event is broadcast on scope.
				    angular.element($window).off("resize", resize);
				    canvas.parentElement.removeChild(canvas);
				    canvas = null;
			    });
			    			    
			}
		};
	}]);