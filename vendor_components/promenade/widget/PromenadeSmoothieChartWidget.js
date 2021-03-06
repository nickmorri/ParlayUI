(function () {
    "use strict";

    var display_name = "SmoothieChart";
    var module_dependencies = ["parlay.widget.template", "parlay.utility"];
    var module_name = "promenade.widget.smoothiechart";
    var directive_name = "promenadeWidgetSmoothieChart";
    var widget_type = "display";
    var directive_function = PromenadeWidgetSmoothieChart;

    // widgetRegistration(display_name, module_name, module_dependencies, directive_name, widget_type, directive_function);

    PromenadeWidgetSmoothieChart.$inject = ["ParlayWidgetTemplate", "$interval", "RandColor"];
    /**
     * @constructor module:PromenadeWidget.PromenadeWidgetSmoothieChart
     * @param {ParlayWidgetTemplate} ParlayWidgetTemplate - [ParlayWidgetTemplate]{@link module:ParlayWidget.ParlayWidgetTemplate} service.
     * @param {Object} $interval - AngularJS [$interval]{@link https://docs.angularjs.org/api/ng/service/$interval} service
     * @param {Object} RandColor - Parlay [RandColor]{@link module:ParlayUtility.RandColor} service.
     */
    function PromenadeWidgetSmoothieChart (ParlayWidgetTemplate, $interval, RandColor) {

        function customLink (scope, element) {

            var lines, chart_interval, chart;

            lines = {};

            chart_interval = 1000;

            scope.paused = false;

            scope.togglePause = function () {
                scope.paused = !scope.paused;
            };

            function values() {
                return scope.items.map(function (container) {
                    return {name: container.item_name, value: container.value};
                }).concat([{name: "transformed_value", value: scope.transformedValue}]);
            }

            var interval_promise = $interval(function () {

                var items = values();

                if (!scope.paused && !!items && items.length > 0) {
                    items.forEach(function (item) {
                        if (lines.hasOwnProperty(item.name)) {
                            lines[item.name].append(new Date().getTime(), item.value);
                        }
                    });
                }

            }, chart_interval);

            var items_deregistration = scope.$watchCollection("items", function (newValue) {

                var randColor = new RandColor();

                chart = new SmoothieChart({
                    grid: {
                        fillStyle: 'transparent',
                        strokeStyle: 'transparent',
                        borderVisible: false
                    },
                    labels: {
                        fillStyle: '#000000'
                    }
                });

                chart.streamTo(element.find("canvas")[0], chart_interval);

                newValue.map(function (item) {
                    return item.item_name;
                }).forEach(function (name) {
                    lines[name] = new TimeSeries();
                    var rgb = randColor.pop().rgb();
                    var rgb_string = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
                    chart.addTimeSeries(lines[name], {strokeStyle: rgb_string, lineWidth: 3});
                });

            });

            scope.$on("$destroy", function () {
                $interval.cancel(interval_promise);
                items_deregistration();
            });

        }

        return new ParlayWidgetTemplate({
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-chart-canvas.html",
            customLink: customLink
        });
    }

}());