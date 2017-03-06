(function () {
    "use strict";

    var module_dependencies = ["parlay.settings"];

    angular
        .module("promenade.smoothiechart", module_dependencies)
        .run(PromenadeSmoothieChartRun)
        .controller("PromenadeSmoothieChartController", PromenadeSmoothieChartController)
        .directive('promenadeSmoothieChart', PromenadeSmoothieChart);

    /**
     * @module PromenadeSmoothieChart
     * @restrict E
     *
     * @description
     * Creates a [SmoothieChart]{@link http://smoothiecharts.org/}
     * [HTML5 Canvas]{@link https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API} element for graphing values.
     *
     * @example
     * <promenade-smoothie-chart delay="1000" streams="data" config="chart_config" smoothie-fn="getSmoothieConfig"></promenade-smoothie-chart>
     *
     * @param {Array} enabled_streams - Contains the name of the streams that should be displayed.
     *
     * @param {Object} stream_data - Contains references to the stream data.
     * {
     *  stream1: {
     *      value: 10,
     *      rate: 5
     *  }
     * }
     *
     * @param {Object} config - Contains configuration data. Please reference the SmoothieChart constructor for options.
     * http://smoothiecharts.org/tutorial.html#mycanvas6
     * @param {Number} [delay=1000] delay - Add delay so upcoming values are known before we need to plot the value.
     * @param {Function} smoothieFn - Configuration retrieval function.
     */

    PromenadeSmoothieChartRun.$inject = ["ParlaySettings"];
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
     * @param {Object} scope - AngularJS [$scope]{@link }https://docs.angularjs.org/guide/scope Object.
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

                    // Array of current stream IDs
                    var current_stream_ids = Object.keys(ctrl.lines);

                    var new_streams = [];
                    var old_streams = [];

                    // Figure out which streams are in the new array of IDs, but not in 
                    // the list of current stream IDs and add them to the new_streams array
                    newValue.forEach(function (stream_obj) {
                        if (current_stream_ids.indexOf(stream_obj.id) == -1)
                            new_streams.push(stream_obj);
                    });

                    // Do the same for the streams that we need to remove
                    // (they're in the old streams but not the new streams)
                    oldValue.forEach(function (stream_obj) {
                        if (newValue.indexOf(stream_obj) == -1)
                            old_streams.push(stream_obj);
                    });

                    old_streams.forEach(removeStream);
                    new_streams.forEach(addStream);

                });
            }
        });

        function addStream (stream) {
            createTimeSeries(stream);
            // Register an onChange handler that will update the TimeSeries.
            stream_watchers[stream.id] = scope.stream_data[stream.id].onChange(function (value) {
                ctrl.lines[stream.id].append((new Date()).getTime(), value);
            });
        }

        function removeStream (stream) {
            // Deregister the onChange handler and delete it's entry.
            stream_watchers[stream.id]();
            delete stream_watchers[stream.id];
            pruneTimeSeries(stream);
        }

        function createTimeSeries (stream) {
            ctrl.lines[stream.id] = new TimeSeries();

            scope.smoothie.addTimeSeries(ctrl.lines[stream.id], {
                strokeStyle: ctrl.colors.pop(),
                lineWidth: 2,
                streamName: stream.name,
                streamID: stream.id
            });
        }

        function pruneTimeSeries (stream) {
            // Re-add the now unused color to available list of colors.
            ctrl.colors.push(scope.smoothie.seriesSet.find(function (series) {
                return series.options.streamID == stream.id;
            }).options.strokeStyle);

            scope.smoothie.removeTimeSeries(ctrl.lines[stream.id]);
            delete ctrl.lines[stream.id];
        }

    }

    PromenadeSmoothieChart.$inject = ['$window', "ParlaySettings"];
    /**
     * Directive constructor for PromenadeSmoothieChart.
     * @param {Object} $window - AngularJS [$window]{@link https://docs.angularjs.org/api/ng/service/$window} service.
     * @param {Object} ParlaySettings - [ParlaySettings]{@link module:ParlaySettings.ParlaySettings} service.
     */
    function PromenadeSmoothieChart ($window, ParlaySettings) {

        /**
         * Returns Function with Canvas element in closure.
         * @param {Canvas} canvas - [HTML5 Canvas]{@link https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API}
         * element.
         */
        function buildSetSize(canvas) {
            // Fills parent element with SmoothieChart HTML5 Canvas object.
            return function setSize() {
                canvas.style.width = "100%";
                canvas.style.height = "auto";
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
                 * Returns [SmoothieChart]{@link http://smoothiecharts.org/} Object.
                 * @returns {SmoothieChart} - Reference to [SmoothieChart]{@link http://smoothiecharts.org/} Object.
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