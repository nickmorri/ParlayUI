function PromenadeAdvancedGraphWidgetRun(ParlayWidgetsCollection) {
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

angular.module("promenade.widgets.advancedgraph", ["parlay.widgets.base", "parlay.widgets.collection"])
    .run(["ParlayWidgetsCollection", PromenadeAdvancedGraphWidgetRun])
    .directive("promenadeAdvancedGraphWidget", [PromenadeAdvancedGraphWidget]);