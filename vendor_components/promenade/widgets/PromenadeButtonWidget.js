function PromenadeButtonWidgetRun(ParlayWidgetsCollection) {
    ParlayWidgetsCollection.registerWidget("promenadeButtonWidget", "input");
}

function PromenadeButtonWidget(ParlayWidgetInputManager) {
    return {
        restrict: "E",
        templateUrl: "../vendor_components/promenade/widgets/directives/promenade-button-widget.html",
        link: function (scope, element) {
            var widgetName = "promenadeButtonWidget";
            var parentElement = element.find("md-card-content");
            var targetTag = "button";
            var events = ["click"];

            var registration = ParlayWidgetInputManager.registerElements(widgetName, parentElement, targetTag, scope, events);

            scope.tag_name = registration.parent_tag_name;
        }
    };
}

angular.module("promenade.widgets.button", ["parlay.widgets.base", "parlay.widgets.collection"])
    .run(["ParlayWidgetsCollection", PromenadeButtonWidgetRun])
    .directive("promenadeButtonWidget", ["ParlayWidgetInputManager", PromenadeButtonWidget]);