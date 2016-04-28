(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.collection"];
    var module_name = "promenade.widget.input";
    var directive_name = "promenadeInputWidget";
    var widget_type = "input";

    widgetRegistration(module_name, directive_name, widget_type);

    angular
        .module(module_name, module_dependencies)
        .directive(directive_name, PromenadeInputWidget);

    PromenadeInputWidget.$inject = ["ParlayWidgetTemplate"];
    function PromenadeInputWidget (ParlayWidgetTemplate) {
        return new ParlayWidgetTemplate({
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-input-widget.html",
            elementRegistration: {
                directive_name: directive_name,
                parent_tag: "md-card-content",
                target_tag: "input",
                events: ["change", "click"]
            }
        });
    }

}());