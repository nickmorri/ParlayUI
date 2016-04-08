function PromenadeDisplayWidgetRun(ParlayWidgetsCollection) {
    ParlayWidgetsCollection.registerWidget("promenadeDisplayWidget");
}

function PromenadeDisplayWidget() {
    return {
        restrict: "E",
        templateUrl: "../vendor_components/promenade/widgets/directives/promenade-display-widget.html"
    };
}

angular.module("promenade.widgets.display", ["parlay.widgets.base", "parlay.widgets.collection"])
    .run(["ParlayWidgetsCollection", PromenadeDisplayWidgetRun])
    .directive("promenadeDisplayWidget", ["ParlayWidgetInputManager", PromenadeDisplayWidget]);
