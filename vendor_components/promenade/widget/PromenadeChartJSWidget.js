(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.collection", "parlay.utility"];
    var module_name = "promenade.widget.chartjs";
    var directive_name = "promenadeWidgetChartJs";
    var widget_type = "display";

    widgetRegistration(module_name, directive_name, widget_type);

    angular
        .module(module_name, module_dependencies)
        .directive(directive_name, PromenadeWidgetChartJs);

    Chart.defaults.global.elements.point.radius = 10;
    Chart.defaults.global.elements.point.hoverRadius = 30;

    PromenadeWidgetChartJs.$inject = ["ParlayWidgetTemplate", "$interval", "RandColor"];
    function PromenadeWidgetChartJs (ParlayWidgetTemplate, $interval, RandColor) {

        function customLink (scope, element) {

            var chart, chart_interval, canvas_context;

            chart_interval = 500;

            canvas_context = element.find("canvas")[0].getContext("2d");

            scope.paused = false;

            scope.togglePause = function () {
                scope.paused = !scope.paused;
            };

            function values(items) {
                return items.map(function (container) {
                    return {name: container.item.name, value: container.item.value};
                }).concat([{name: "transformed_value", value: scope.transformedValue}]);
            }

            var interval_promise = $interval(function () {

                var items = values(scope.items);

                if (!!items && items.length > 0) {
                    items.forEach(function (item) {

                        var data = chart.data.datasets.find(function (dataset) {
                            return dataset.label == item.name;
                        }).data;

                        data.push(item.value);

                        if (data.length > 20) {
                            data.shift();
                        }

                    });

                    chart.data.labels.push("");

                    if (chart.data.labels.length > 20) {
                        chart.data.labels.shift();
                    }
                }

                if (!scope.paused) {
                    chart.update();
                }

            }, chart_interval);

            var items_deregistration = scope.$watchCollection("items", function (newValue) {

                var randColor = new RandColor();

                chart = new Chart(canvas_context, {
                    type: "line",
                    options: {
                        stacked: true,
                        xAxes: [{display: false}]
                    },
                    data: {
                        labels: [""],
                        datasets: values(newValue).map(function (container) {
                            return {label: container.name, data: [], backgroundColor: randColor.pop().hex()};
                        }).concat([{label: "transformed_value", data: [], backgroundColor: randColor.pop().hex()}])
                    }
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