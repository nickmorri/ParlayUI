(function () {
    "use strict";
    var display_name = "Text Display";
    var module_dependencies = ["parlay.widget.base.card"];
    var module_name = "promenade.widget.display";
    var directive_name = "promenadeWidgetDisplay";
    var widget_type = "display";
    var directive_definition = {
        title: "Display Text",
        templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-display.html"
    };

    widgetRegistration(display_name, module_name, module_dependencies, directive_name, widget_type, directive_definition);
    
}());