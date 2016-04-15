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
    }

    PromenadeAdvancedGraphWidget.$inject = ["$interval"];
    function PromenadeAdvancedGraphWidget ($interval) {
        return {
            restrict: "E",
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-advanced-graph-widget.html",
            link: function (scope, element) {

                scope.series = [];

                var graph = new Rickshaw.Graph({
                    width: 580,
                    height: 250,
                    element: element.find("md-card-contents")[0],
                    series: scope.series
                });

                function values() {
                    return scope.configuration.transformer.items.map(function (container) {
                        return {
                            name: container.item.name,
                            value: container.item.value
                        };
                    });
                }

                $interval(function () {

                    values().forEach(function (item) {
                        scope.series.find(function (series) {
                            return series.name == item.name;
                        }).data.push(item.value);
                    });

                    graph.render();

                }, 1000);

                scope.$watchCollection("configuration.transformer.items", function (newValue) {
                    if (!!newValue) {
                        scope.series = newValue.map(function (container) {
                            return { name: container.item.name, data: [container.item.value] };
                        });
                    }
                });

            }
        };
    }

}());