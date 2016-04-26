(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.collection", "parlay.utility"];
    var module_name = "promenade.widgets.chartjs";
    var directive_name = "promenadeChartJsWidget";

    widget_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .run(PromenadeChartJsWidgetRun)
        .directive(directive_name, PromenadeChartJsWidget);

    PromenadeChartJsWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeChartJsWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget(directive_name, "display");
        Chart.defaults.global.elements.point.radius = 10;
        Chart.defaults.global.elements.point.hoverRadius = 30;
    }

    PromenadeChartJsWidget.$inject = ["$interval", "RandColor"];
    function PromenadeChartJsWidget ($interval, RandColor) {
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

                var chart, randColor;

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

                }, 500);

                scope.$watchCollection("items", function (newValue) {
                    
                    randColor = new RandColor();

                    chart = new Chart(element.find("canvas")[0].getContext("2d"), {
                        type: "line",
                        options: {
                            stacked: true,
                            xAxes: [{display: false}]
                        },
                        data: {
                            labels: [""],
                            datasets: newValue.map(function (container) {
                                return {label: container.item.name, data: [], backgroundColor: randColor.pop().hex()};
                            }).concat([{label: "transformed_value", data: [], backgroundColor: randColor.pop().hex()}])
                        }
                    });

                });

            }
        };
    }

}());