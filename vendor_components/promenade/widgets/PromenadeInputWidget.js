function PromenadeInputWidgetRun(ParlayWidgetsCollection) {
    ParlayWidgetsCollection.registerWidget("promenadeInputWidget");
}

function PromenadeInputWidget(ParlayWidgetInputManager) {
    return {
        restrict: "E",
        templateUrl: "../vendor_components/promenade/widgets/directives/promenade-input-widget.html",
        link: function (scope, element) {
            ParlayWidgetInputManager.registerInputs(element, scope);
        }
    };
}

angular.module("promenade.widgets.input", ["parlay.widgets.base", "parlay.widgets.collection"])
    .run(["ParlayWidgetsCollection", PromenadeInputWidgetRun])
    .directive("promenadeInputWidget", ["ParlayWidgetInputManager", PromenadeInputWidget]);
