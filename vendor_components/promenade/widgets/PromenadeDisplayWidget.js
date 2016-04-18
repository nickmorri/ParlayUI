(function () {
    "use strict";

    var module_name = "promenade.widgets.display";
    var directive_name = "promenadeDisplayWidget";

    widget_modules.push(module_name);

    var module_dependencies = ["parlay.widgets.base", "parlay.widgets.collection"];

    angular
        .module(module_name, module_dependencies)
        .run(PromenadeDisplayWidgetRun)
        .directive(directive_name, PromenadeDisplayWidget);

    PromenadeDisplayWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeDisplayWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget(directive_name, "display");
    }

    PromenadeDisplayWidget.$inject = ["ParlayWidgetInputManager"];
    function PromenadeDisplayWidget () {
        return {
            restrict: "E",
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-display-widget.html"
        };
    }

}());