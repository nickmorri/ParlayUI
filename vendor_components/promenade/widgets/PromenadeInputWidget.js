(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.base", "parlay.widgets.collection"];

    angular
        .module("promenade.widgets.input", module_dependencies)
        .run(PromenadeInputWidgetRun)
        .directive("promenadeInputWidget", PromenadeInputWidget);

    PromenadeInputWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeInputWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget("promenadeInputWidget", "input");
    }

    PromenadeInputWidget.$inject = ["ParlayWidgetInputManager"];
    function PromenadeInputWidget (ParlayWidgetInputManager) {
        return {
            restrict: "E",
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-input-widget.html",
            link: function (scope, element) {
                var widgetName = "promenadeInputWidget";
                var parentElement = element.find("md-card-content");
                var targetTag = "input";
                var events = ["change"];

                var registration = ParlayWidgetInputManager.registerElements(widgetName, parentElement, targetTag, scope, events);

                scope.tag_name = registration.parent_tag_name;
            }
        };
    }

}());