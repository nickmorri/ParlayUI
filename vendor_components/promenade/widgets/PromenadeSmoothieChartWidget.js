(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.collection"];

    var module_name = "promenade.widgets.smoothiechart";

    widget_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .run(PromenadeBasicGraphWidgetRun)
        .directive("promenadeSmoothieChartWidget", PromenadeBasicGraphWidget);

    PromenadeBasicGraphWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeBasicGraphWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget("promenadeSmoothieChartWidget", "display");
    }

    function PromenadeBasicGraphWidget () {
        return {
            restrict: "E",
            scope: {
                index: "=",
                items: "=",
                transformedValue: "=",
                widgetsCtrl: "=",
                edit: "="
            },
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-smoothie-chart-widget.html",
            link: function (scope, element) {

                var smoothie = new SmoothieChart({
                    grid: {
                        strokeStyle:'rgb(125, 0, 0)',
                        fillStyle:'rgb(60, 0, 0)',
                        lineWidth: 1,
                        millisPerLine: 250,
                        verticalSections: 6
                    },
                    labels: {
                        fillStyle:'rgb(60, 0, 0)'
                    }
                });

                smoothie.streamTo(element.find("canvas")[0], 1000);

                var line = new TimeSeries();
                smoothie.addTimeSeries(line);

                scope.$watch("transformedValue", function (newValue) {
                    if (!!newValue) {
                        line.append(new Date().getTime(), newValue);
                    }
                });

            }
        };
    }

}());