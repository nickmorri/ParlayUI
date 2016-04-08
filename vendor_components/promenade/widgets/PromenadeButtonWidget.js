function PromenadeButtonWidgetRun(ParlayWidgetsCollection) {
    ParlayWidgetsCollection.registerWidget("promenadeButtonWidget", "input");
}

function PromenadeButtonWidget(ParlayWidgetInputManager) {
    return {
        restrict: "E",
        templateUrl: "../vendor_components/promenade/widgets/directives/promenade-button-widget.html",
        link: function (scope, element) {
            scope.tag_name = ParlayWidgetInputManager.registerButtons(element, scope);
        }
    };
}

angular.module("promenade.widgets.button", ["parlay.widgets.base", "parlay.widgets.collection"])
    .run(["ParlayWidgetsCollection", PromenadeButtonWidgetRun])
    .directive("promenadeButtonWidget", ["ParlayWidgetInputManager", PromenadeButtonWidget]);