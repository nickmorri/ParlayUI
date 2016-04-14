(function () {

    var module_dependencies = ["parlay.widgets.base", "parlay.widgets.collection"];

    angular
        .module("promenade.widgets.basicgraph", module_dependencies)
        .run(PromenadeBasicGraphWidgetRun)
        .directive("promenadeBasicGraphWidget", PromenadeBasicGraphWidget);

    PromenadeBasicGraphWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeBasicGraphWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget("promenadeBasicGraphWidget", "display");
    }

    function PromenadeBasicGraphWidget () {
        return {
            restrict: "E",
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-basic-graph-widget.html",
            link: function (scope, element) {

                this.smoothie = new SmoothieChart({
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

                this.smoothie.streamTo(element.find("canvas")[0], 1000);

                var line = new TimeSeries();
                this.smoothie.addTimeSeries(line);

                scope.$watch("configuration.transformer.value", function (newValue) {
                    if (!!newValue) {
                        line.append(new Date().getTime(), newValue);
                    }
                });

            }
        };
    }

}());