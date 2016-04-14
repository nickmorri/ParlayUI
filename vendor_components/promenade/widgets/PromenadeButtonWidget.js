(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.base", "parlay.widgets.collection"];

    angular
        .module("promenade.widgets.button", module_dependencies)
        .run(PromenadeButtonWidgetRun)
        .directive("promenadeButtonWidget", PromenadeButtonWidget);

    PromenadeButtonWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeButtonWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget("promenadeButtonWidget", "input");
    }

    PromenadeButtonWidget.$inject = ["ParlayWidgetInputManager"];
    function PromenadeButtonWidget (ParlayWidgetInputManager) {
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

}());