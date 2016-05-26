(function () {
    "use strict";

    var module_dependencies = ["parlay.settings"];

    angular
        .module("promenade.smoothiechart", module_dependencies)
        .run(PromenadeSmoothieChartRun)
        .controller("PromenadeSmoothieChartController", PromenadeSmoothieChartController)
        .directive('promenadeSmoothieChart', PromenadeSmoothieChart);

    PromenadeSmoothieChartRun.$inject = ["ParlaySettings"];
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
     * @param {Number} [delay=1000] delay - Add delay so upcoming values are known before we need to plot the value.
     * @param {Function} smoothieFn - Configuration retrieval function.
     */
    function PromenadeSmoothieChartRun(ParlaySettings) {
        ParlaySettings.registerDefault("graph", {label_size: 12});

        if (!ParlaySettings.has("graph")) {
            ParlaySettings.restoreDefault("graph");
        }
    }

    PromenadeSmoothieChartController.$inject = ["$scope"];
    /**
     * Controller constructor for the PromenadeSmoothieChart.
     * @constructor
     * @param {Object} scope - A AngularJS $scope Object.
     * @param {Object} $interval - AngularJS interval Service.
     * @param {Object} ParlaySettings - ParlaySettings Service.
     */
    function PromenadeSmoothieChartController (scope) {

        var ctrl = this;

        // Easy colors to see on most transparent backgrounds.
        ctrl.colors = ["#000000", "#0433ff", "#aa7942", "#00fdff", "#00f900", "#ff40ff", "#ff9300", "#942192", "#ff2600", "#666633"];

        // Container for TimeSeries Objects.
        ctrl.lines = {};

        // Container for onChange registrations.
        var stream_watchers = {};

        scope.$watch("smoothie", function (newValue) {
            if (!!newValue) {
                scope.$watchCollection("enabled_streams", function (newValue, oldValue) {

                    var current_lines = Object.keys(ctrl.lines);

                    var new_streams, old_streams;

                    // Generate Array of streams that differ and should be disabled.
                    old_streams = current_lines.filter(function (line) {
                        return newValue.indexOf(line) === -1;
                    });

                    // Generate Array of streams that differ and should be enabled.
                    new_streams = newValue.filter(function (line) {
                        return current_lines.indexOf(line) === -1;
                    });

                    old_streams.forEach(removeStream);
                    new_streams.forEach(addStream);

                });
            }
        });

        function addStream (stream_name) {
            createTimeSeries(stream_name);
            // Register an onChange handler that will update the TimeSeries.
            stream_watchers[stream_name] = scope.stream_data[stream_name].onChange(function (value) {
                ctrl.lines[stream_name].append((new Date()).getTime(), value);
            });
        }

        function removeStream (stream_name) {
            // Deregister the onChange handler and delete it's entry.
            stream_watchers[stream_name]();
            delete stream_watchers[stream_name];
            pruneTimeSeries(stream_name);
        }

        function createTimeSeries (stream_name) {
            ctrl.lines[stream_name] = new TimeSeries();

            scope.smoothie.addTimeSeries(ctrl.lines[stream_name], {
                strokeStyle: ctrl.colors.pop(),
                lineWidth: 2,
                streamName: stream_name
            });
        }

        function pruneTimeSeries (stream_name) {
            // Re-add the now unused color to available list of colors.
            ctrl.colors.push(scope.smoothie.seriesSet.find(function (series) {
                return series.options.streamName === stream_name;
            }).options.strokeStyle);

            scope.smoothie.removeTimeSeries(ctrl.lines[stream_name]);
            delete ctrl.lines[stream_name];
        }

    }

    PromenadeSmoothieChart.$inject = ['$window', "ParlaySettings"];
    /**
     * Directive constructor for PromenadeStandardItemCardProperty.
     * @param {Object} $window - AngularJS Window Service.
     * @param {Object} ParlaySettings - ParlaySettings Service.
     * @returns {Object} - Directive configuration.
     */
    function PromenadeSmoothieChart ($window, ParlaySettings) {

        /**
         * Returns Function with canvas element in closure.
         * @param {canvas} canvas - HTML Canvas element.
         */
        function buildSetSize(canvas) {
            // Fills parent element with SmoothieChart HTML5 Canvas object.
            return function setSize() {
                canvas.style.width = "100%";
                canvas.style.height = "100%";
                canvas.width = canvas.offsetWidth;
                canvas.height = 300;
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
                        var padding = range.min !== 0 ? (range.min * 0.75) : 10;
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
                        fontSize: ParlaySettings.get("graph").label_size
                    }
                });

                // Attaches SmoothieChart to HTML5 Canvas element.
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

}());