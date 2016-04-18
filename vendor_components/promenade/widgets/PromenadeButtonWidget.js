(function () {
    "use strict";

    var module_name = "promenade.widgets.button";
    var directive_name = "promenadeButtonWidget";

    widget_modules.push(module_name);

    var module_dependencies = ["parlay.widgets.base", "parlay.widgets.collection"];

    angular
        .module(module_name, module_dependencies)
        .run(PromenadeButtonWidgetRun)
        .directive(directive_name, PromenadeButtonWidget);

    PromenadeButtonWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeButtonWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget(directive_name, "input");
    }

    PromenadeButtonWidget.$inject = ["ParlayWidgetInputManager"];
    function PromenadeButtonWidget (ParlayWidgetInputManager) {
        return {
            restrict: "E",
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-button-widget.html",
            link: function (scope, element) {
                var parentElement = element.find("md-card-content");
                var targetTag = "button";
                var events = ["click"];

                var registration = ParlayWidgetInputManager.registerElements(directive_name, parentElement, targetTag, scope, events);

                scope.tag_name = registration.parent_tag_name;
            }
        };
    }

}());