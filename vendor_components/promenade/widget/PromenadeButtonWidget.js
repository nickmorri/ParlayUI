(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.collection", "promenade.widget.template"];
    var module_name = "promenade.widget.button";
    var directive_name = "promenadeWidgetButton";
    var widget_type = "input";

    widgetRegistration(module_name, directive_name, widget_type);

    angular
        .module(module_name, module_dependencies)
        .directive(directive_name, PromenadeWidgetButton);

    PromenadeWidgetButton.$inject = ["ParlayWidgetTemplate"];
    function PromenadeWidgetButton (ParlayWidgetTemplate) {
        return new ParlayWidgetTemplate({
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-button.html",
            elementRegistration: {
                directive_name: directive_name,
                parent_tag: "md-card-content",
                target_tag: "button",
                events: ["click"]
            }
        });
    }

}());