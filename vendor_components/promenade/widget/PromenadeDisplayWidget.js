(function () {
    "use strict";

    var module_dependencies = [];
    var module_name = "promenade.widget.display";
    var directive_name = "promenadeWidgetDisplay";
    var widget_type = "display";
    var directive_definition = {
        templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-display.html"
    };

    widgetRegistration(module_name, module_dependencies, directive_name, widget_type, directive_definition);
    
}());