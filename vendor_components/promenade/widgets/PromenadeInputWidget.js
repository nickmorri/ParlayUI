function PromenadeInputWidgetRun(ParlayWidgetsCollection) {
    ParlayWidgetsCollection.registerWidget("promenadeInputWidget", "input");
}

function PromenadeInputWidget(ParlayWidgetInputManager) {
    return {
        restrict: "E",
        templateUrl: "../vendor_components/promenade/widgets/directives/promenade-input-widget.html",
        link: function (scope, element) {
            var widgetName = "promenadeInputWidget";
            var parentElement = element.find("md-card-content");
            var targetTag = "input";
            var events = ["change"];

            scope.tag_name = ParlayWidgetInputManager.registerElements(widgetName, parentElement, targetTag, scope, events);
        }
    };
}

angular.module("promenade.widgets.input", ["parlay.widgets.base", "parlay.widgets.collection"])
    .run(["ParlayWidgetsCollection", PromenadeInputWidgetRun])
    .directive("promenadeInputWidget", ["ParlayWidgetInputManager", PromenadeInputWidget]);
