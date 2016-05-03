(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.collection"];
    var module_name = "promenade.widget.input";
    var directive_name = "promenadeWidgetInput";
    var widget_type = "input";
    var directive_function = PromenadeWidgetInput;

    widgetRegistration(module_name, module_dependencies, directive_name, widget_type, directive_function);

    PromenadeWidgetInput.$inject = ["ParlayWidgetTemplate"];
    function PromenadeWidgetInput (ParlayWidgetTemplate) {
        return new ParlayWidgetTemplate({
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-input.html",
            elementRegistration: {
                directive_name: directive_name,
                parent_tag: "md-card-content",
                target_tag: "input",
                events: ["change", "click"]
            }
        });
    }

}());