(function () {
    "use strict";

    var display_name = "Text Input";
    var module_dependencies = ["parlay.widget.input","parlay.data"];
    var module_name = "promenade.widget.input";
    var directive_name = "promenadeWidgetInput";
    var widget_type = "input";
    var directive_definition = {
        templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-input.html",
        customizationDefaults: {
            label: {
                property_name: "label",
                type: "text",
                value: "Label:"
            },
            inputtype: {
                property_name: "inputtype",
                type: "text-choice",
                value: ["text"],
                choices: ["number", "text"]
            }
        },
        properties:
        {
            text: {
                default: ""
            }
        }

    };

    widgetRegistration(display_name, module_name, module_dependencies, directive_name, widget_type, directive_definition, []);

}());