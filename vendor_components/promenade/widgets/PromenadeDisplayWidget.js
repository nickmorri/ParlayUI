(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.collection"];
    var module_name = "promenade.widgets.display";
    var directive_name = "promenadeDisplayWidget";

    widget_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .run(PromenadeDisplayWidgetRun)
        .directive(directive_name, PromenadeDisplayWidget);

    PromenadeDisplayWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeDisplayWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget(directive_name, "display");
    }

    function PromenadeDisplayWidget () {
        return {
            restrict: "E",
            scope: {
                index: "=",
                items: "=",
                transformedValue: "=",
                widgetsCtrl: "=",
                edit: "=",
                editing: "="
            },
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-display-widget.html"
        };
    }

}());