(function () {
    "use strict";

    var module_dependencies = [];
    var module_name = "promenade.widget.button";
    var directive_name = "promenadeWidgetButton";
    var widget_type = "input";
    var directive_definition = {
        templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-button.html",
        eventRegistration: {
            directive_name: directive_name,
            parent_tag: "md-card-content",
            target_tag: "button",
            events: ["click"]
        }
    };

    widgetRegistration(module_name, module_dependencies, directive_name, widget_type, directive_definition);

}());