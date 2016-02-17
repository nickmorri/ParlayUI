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
 * @param {Array} enabled_streams - Contains the name of the streams that should be displayed.
 *
 * @param {Object} stream_data - Contains references to the stream data.
 * {
 *	 stream1: {
 *	 	value: 10,
 *		rate: 5
 * 	 }
 * }
 *
 * @param {Object} config - Contains configuration data. Please reference the SmoothieChart constructor for options. http://smoothiecharts.org/tutorial.html#mycanvas6
 * @param {Number} [delay=1000] delay - Add delay so uncoming values are known before we need to plot the value.
 * @param {Function} smoothieFn - Configuration retrieval function.
 */


/**
 * Controller constructor for the PromenadeSmoothieChart.
 * @constructor
 * @param {AngularJS $scope} scope - A AngularJS $scope Object.
 * @param {AngularJS Service} $interval - AngularJS interval Service.
 */
function PromenadeSmoothieChartController(scope, $interval) {

    // Easy colors to see on most transparent backgrounds.
    this.colors = ["#000000", "#0433ff", "#aa7942", "#00fdff", "#00f900", "#ff40ff", "#ff9300", "#942192", "#ff2600", "#666633"];

    // Container for TimeSeries Objects.
    this.lines = {};

    /**
     * Return streams that are currently enabled in scope.streams.
     * @returns {Array} - Array of stream Objects.
     */
    this.getEnabledStreams = function() {
        return Object.keys(scope.stream_data).map(function (key) {
            return scope.stream_data[key];
        }).filter(function (stream) {
            return scope.enabled_streams.indexOf(stream.NAME) > -1;
        });
    }.bind(this);

    /**
     * If a Smoothie TimeSeries doesn't exist for an enabled stream we should create it.
     * @param {Array} streams - Array of enabled streams.
     */
    this.createTimeSeries = function(streams) {
        streams.filter(function (stream) {
            return !this.lines[stream.NAME];
        }, this).forEach(function(stream) {
            this.lines[stream.NAME] = new TimeSeries();

            scope.smoothie.addTimeSeries(this.lines[stream.NAME], {
                strokeStyle: this.colors.pop(),
                lineWidth: 2,
                streamName: stream.NAME
            });
        }, this);
    }.bind(this);

    /**
     * If a Smoothie TimeSeries exists for a stream that is not enabled we should remove it.
     * @param {Array} streams - Array of enabled streams.
     */
    this.pruneTimeSeries = function(streams) {
        Object.keys(this.lines).filter(function(key) {
            return !streams.some(function(stream) { return stream.NAME === key; });
        }, this).forEach(function (key) {

            // Re-add the now unused color to available list of colors.
            this.colors.push(scope.smoothie.seriesSet.find(function (series) {
                return series.options.streamName === key;
            }).options.strokeStyle);

            scope.smoothie.removeTimeSeries(this.lines[key]);
            delete this.lines[key];
        }, this);
    }.bind(this);

    /**
     * Append the current time and value for each enabled stream.
     * @param {Object} stream - Enabled stream object.
     */
    this.updateStreamLine = function(stream) {
        // Skip appending an undefined stream value.
        if (stream.value) {
            this.lines[stream.NAME].append(new Date().getTime(), stream.value);
        }
    }.bind(this);

    this.updateLines = function() {
        // Get an array of currently enabled streams.
        var enabled_streams = this.getEnabledStreams();

        // If the TimeSeries doesn't exist create it.
        this.createTimeSeries(enabled_streams);

        // If a line is removed we should remove the TimeSeries from the SmoothieChart.
        this.pruneTimeSeries(enabled_streams);

        // Update the TimeSeries with the latest stream value.
        enabled_streams.forEach(this.updateStreamLine);

    }.bind(this);

    // At at an interval specified by scope.delay ensure that the values available in scope.values are consistent with the SmoothieChart.
    var interval_registration = $interval(this.updateLines, scope.delay);

    // When the scope the PromenadeSmoothieChart exists on is destroyed we need to cancel our update interval.
    scope.$on("$destroy", function () {
        $interval.cancel(interval_registration);
    });
}

/**
 * Directive constructor for PromenadeStandardItemCardProperty.
 * @param {AngularJS Service} $window - AngularJS Window Service.
 * @returns {Object} - Directive configuration.
 */
function PromenadeSmoothieChart($window) {

    /**
     * Returns Function with canvas element in closure.
     * @param {canvas} canvas - HTML Canvas element.
     */
    function buildSetSize(canvas) {
        /**
         * Fills parent element with SmoothieChart HTML5 Canvas object.
         */
        return function setSize() {
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
    }

    return {
        restrict: 'E',
        scope: {
            delay: "=?",
            enabled_streams: "=enabledStreams",
            stream_data: '=streamData',
            config: '=',
            getSmoothie: '=smoothieFn'
        },
        controller: "PromenadeSmoothieChartController",
        controllerAs: "ctrl",
        link: function (scope, element) {
            var canvas, resize;

            // If scope.delay wasn't provided we should default to 1000.
            if (scope.delay === undefined) {
                scope.delay = 1000;
            }

            // Create HTML5 canvas DOM element.
            canvas = document.createElement("canvas");

            // Add it as a child to our directive element.
            element[0].appendChild(canvas);

            // Use the configuration from scope if available. Otherwise use the default configuration.
            scope.smoothie = new SmoothieChart(scope.config ? scope.config : {
                yRangeFunction: function (range) {
                    // We want the minimum and maximum range to have some padding from the actual values.
                    var padding = (range.min * 0.75);
                    return {
                        min: isNaN(range.min) ? range.min : range.min - padding,
                        max: isNaN(range.max) ? range.min : range.max + padding
                    };
                },
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
            scope.smoothie.streamTo(canvas, scope.delay);

            // If the window resizes we are going to need to resize our graphs as well.
            // They will not automatically resize otherwise.
            resize = buildSetSize(canvas);

            // Do initial resizing.
            resize();

            // Setup listener on $window resize event.
            angular.element($window).on("resize", resize);

            /**
             * Returns SmoothieChart object.
             * @returns {SmoothieChart} - Reference to SmoothieChart object.
             */
            scope.getSmoothie = function() {
                return scope.smoothie;
            };

            // When the scope the PromenadeSmoothieChart exists on is destroyed we need to cleanup listeners and remove the canvas element.
            scope.$on("$destroy", function () {
                angular.element($window).off("resize", resize);
                canvas.parentElement.removeChild(canvas);
                canvas = null;
            });

        }
    };
}

angular.module("promenade.smoothiechart", [])
    .controller("PromenadeSmoothieChartController", ["$scope", "$interval", PromenadeSmoothieChartController])
    .directive('promenadeSmoothieChart', ['$window', PromenadeSmoothieChart]);