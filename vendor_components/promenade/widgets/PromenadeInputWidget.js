(function () {
    "use strict";

    var module_name = "promenade.widgets.input";
    var directive_name = "promenadeInputWidget";

    widget_modules.push(module_name);

    var module_dependencies = ["parlay.widgets.base", "parlay.widgets.collection"];

    angular
        .module(module_name, module_dependencies)
        .run(PromenadeInputWidgetRun)
        .directive(directive_name, PromenadeInputWidget);

    PromenadeInputWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeInputWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget(directive_name, "input");
    }

    PromenadeInputWidget.$inject = ["ParlayWidgetInputManager"];
    function PromenadeInputWidget (ParlayWidgetInputManager) {
        return {
            restrict: "E",
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-input-widget.html",
            link: function (scope, element) {
                var parentElement = element.find("md-card-content");
                var targetTag = "input";
                var events = ["change"];

                var registration = ParlayWidgetInputManager.registerElements(directive_name, parentElement, targetTag, scope, events);

                scope.tag_name = registration.parent_tag_name;
            }
        };
    }

}());