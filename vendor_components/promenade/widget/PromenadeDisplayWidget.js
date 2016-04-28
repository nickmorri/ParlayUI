(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.collection"];
    var module_name = "promenade.widget.display";
    var directive_name = "promenadeDisplayWidget";
    var widget_type = "display";

    widgetRegistration(module_name, directive_name, widget_type);

    angular
        .module(module_name, module_dependencies)
        .directive(directive_name, PromenadeDisplayWidget);

    PromenadeDisplayWidget.$inject = ["ParlayWidgetTemplate"];
    function PromenadeDisplayWidget (ParlayWidgetTemplate) {
        return new ParlayWidgetTemplate({
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-display-widget.html"
        });
    }

}());