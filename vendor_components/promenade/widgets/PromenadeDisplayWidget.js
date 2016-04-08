function PromenadeDisplayWidgetRun(ParlayWidgetsCollection) {
    ParlayWidgetsCollection.registerWidget("promenadeDisplayWidget");
}

function PromenadeDisplayWidget(ParlayWidgetInputManager) {
    return {
        restrict: "E",
        templateUrl: "../vendor_components/promenade/widgets/directives/promenade-display-widget.html",
        link: function (scope, element) {
            ParlayWidgetInputManager.registerInputs(element, scope);
        }
    };
}

angular.module("promenade.widgets.display", ["parlay.widgets.base", "parlay.widgets.collection"])
    .run(["ParlayWidgetsCollection", PromenadeDisplayWidgetRun])
    .directive("promenadeDisplayWidget", ["ParlayWidgetInputManager", PromenadeDisplayWidget]);
