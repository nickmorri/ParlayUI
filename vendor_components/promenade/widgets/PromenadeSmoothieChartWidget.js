(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.collection", "parlay.utility"];
    var module_name = "promenade.widgets.smoothiechart";
    var directive_name = "promenadeSmoothieChartWidget";

    widget_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .run(PromenadeSmoothieChartWidgetRun)
        .directive(directive_name, PromenadeSmoothieChartWidget);

    PromenadeSmoothieChartWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeSmoothieChartWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget(directive_name, "display");
    }

    PromenadeSmoothieChartWidget.$inject = ["$interval", "RandColor"];
    function PromenadeSmoothieChartWidget ($interval, RandColor) {
        return {
            restrict: "E",
            scope: {
                index: "=",
                items: "=",
                transformedValue: "=",
                widgetsCtrl: "=",
                edit: "=",
                editing: "="
            },
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-chart-canvas-widget.html",
            link: function (scope, element) {

                scope.$parent.childLoad();

                var chart, lines, randColor;

                lines = {};

                scope.paused = false;

                scope.togglePause = function () {
                    scope.paused = !scope.paused;
                };

                function values() {
                    return scope.items.map(function (container) {
                        return {name: container.item.name, value: container.item.value};
                    }).concat([{name: "transformed_value", value: scope.transformedValue}]);
                }

                $interval(function () {

                    var items = values();

                    if (!scope.paused && !!items && items.length > 0) {
                        items.forEach(function (item) {
                            if (!!lines[item.name]) {
                                lines[item.name].append(new Date().getTime(), item.value);
                            }
                        });
                    }

                }, 1000);

                scope.$watchCollection("items", function (newValue) {

                    randColor = new RandColor();

                    chart = new SmoothieChart({
                        grid: {
                            fillStyle: 'transparent',
                            strokeStyle: 'transparent',
                            borderVisible: false
                        },
                        labels: {
                            fillStyle: '#000000',
                        }
                    });

                    chart.streamTo(element.find("canvas")[0], 1000);

                    newValue.forEach(function (item) {
                        lines[item.item.name] = new TimeSeries();
                        var rgb = randColor.pop().rgb();
                        chart.addTimeSeries(lines[item.item.name], {
                            strokeStyle: "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")",
                            lineWidth: 3
                        });
                    });

                });

            }
        };
    }

}());