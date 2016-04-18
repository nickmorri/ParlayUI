(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.collection"];

    var module_name = "promenade.widgets.display";

    widget_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .run(PromenadeDisplayWidgetRun)
        .directive("promenadeDisplayWidget", PromenadeDisplayWidget);

    PromenadeDisplayWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeDisplayWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget("promenadeDisplayWidget", "display");
    }

    function PromenadeDisplayWidget () {
        return {
            restrict: "E",
            scope: {
                index: "=",
                items: "=",
                transformedValue: "=",
                widgetsCtrl: "=",
                edit: "="
            },
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-display-widget.html"
        };
    }

}());