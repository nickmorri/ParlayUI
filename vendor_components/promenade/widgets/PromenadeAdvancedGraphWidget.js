(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.base", "parlay.widgets.collection", "parlay.utility"];

    angular
        .module("promenade.widgets.advancedgraph", module_dependencies)
        .run(PromenadeAdvancedGraphWidgetRun)
        .directive("promenadeAdvancedGraphWidget", PromenadeAdvancedGraphWidget);

    PromenadeAdvancedGraphWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeAdvancedGraphWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget("promenadeAdvancedGraphWidget", "display");
        Chart.defaults.global.elements.point.radius = 10;
        Chart.defaults.global.elements.point.hoverRadius = 30;
    }

    PromenadeAdvancedGraphWidget.$inject = ["$interval", "RandColor"];
    function PromenadeAdvancedGraphWidget ($interval, RandColor) {
        return {
            restrict: "E",
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-advanced-graph-widget.html",
            link: function (scope, element) {

                var chart, randColor;

                randColor = new RandColor();

                scope.paused = false;
                
                scope.togglePause = function () {
                    scope.paused = !scope.paused;
                };

                function values() {
                    return scope.configuration.transformer.items.map(function (container) {
                        return {name: container.item.name, value: container.item.value};
                    }).concat([{name: "transformed_value", value: scope.configuration.transformer.value}]);
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

                scope.$watchCollection("configuration.transformer.items", function (newValue, oldValue) {

                    if (!!oldValue && !!chart) {
                        chart.data.datasets.map(function (dataset) {
                            return dataset.backgroundColor;
                        }).forEach(function (color) {
                            randColor.push(color);
                        });
                    }

                    chart = new Chart(element.find("canvas")[0].getContext("2d"), {
                        type: "line",
                        options: {
                            stacked: true,
                            xAxes: [{display: false}]
                        },
                        data: {
                            labels: [""],
                            datasets: newValue.map(function (container) {
                                return {label: container.item.name, data: [], backgroundColor: randColor.pop().code};
                            }).concat([{label: "transformed_value", data: [], backgroundColor: randColor.pop().code}])
                        }
                    });

                });

            }
        };
    }

}());