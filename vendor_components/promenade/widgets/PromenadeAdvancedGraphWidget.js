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

    function PromenadeAdvancedGraphWidget() {
        "use strict";
        return {
            restrict: "E",
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-advanced-graph-widget.html",
            link: function (scope) {

                scope.$watch("configuration.transformer.value", function (newValue) {

                });

            }
        };
    }

}());