(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.base", "parlay.widgets.collection"];

    angular
        .module("promenade.widgets.advancedgraph", module_dependencies)
        .run(PromenadeAdvancedGraphWidgetRun)
        .directive("promenadeAdvancedGraphWidget", PromenadeAdvancedGraphWidget);

    PromenadeAdvancedGraphWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeAdvancedGraphWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget("promenadeAdvancedGraphWidget", "display");
        Chart.defaults.global.animation = false;
    }

    PromenadeAdvancedGraphWidget.$inject = ["$interval", "$window"];
    function PromenadeAdvancedGraphWidget ($interval, $window) {
        return {
            restrict: "E",
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-advanced-graph-widget.html",
            link: function (scope, element) {

                var start, chart;

                scope.paused = false;
                
                scope.togglePause = function () {
                    scope.paused = !scope.paused;
                };

                function values() {

                    var items = scope.configuration.transformer.items.map(function (container) {
                        return {
                            name: container.item.name,
                            value: container.item.value
                        };
                    });

                    var transformed = {
                        name: "transformed_value",
                        value: scope.configuration.transformer.value
                    };

                    items.push(transformed);

                    return items;
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

                scope.$watchCollection("configuration.transformer.items", function (newValue) {
                    if (!!newValue) {

                        start = (new Date()).getSeconds();

                        var datasets = newValue.map(function (container) {
                            return {
                                label: container.item.name,
                                data: []
                            };
                        });

                        var transformed = {
                            label: "transformed_value",
                            data: []
                        };

                        datasets.push(transformed);

                        chart = new Chart(element.find("canvas")[0].getContext("2d"), {
                            type: "line",
                            data: {
                                labels: [""],
                                datasets: datasets
                            }
                        });

                    }
                });

            }
        };
    }

}());