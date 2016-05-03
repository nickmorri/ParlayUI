(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.collection"];
    var module_name = "promenade.widget.display";
    var directive_name = "promenadeWidgetDisplay";
    var widget_type = "display";
    var directive_function = PromenadeWidgetDisplay;

    widgetRegistration(module_name, module_dependencies, directive_name, widget_type, directive_function);

    PromenadeWidgetDisplay.$inject = ["ParlayWidgetTemplate"];
    function PromenadeWidgetDisplay (ParlayWidgetTemplate) {
        return new ParlayWidgetTemplate({
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-display.html"
        });
    }

}());