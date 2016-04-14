(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.base", "parlay.widgets.collection"];

    angular
        .module("promenade.widgets.display", module_dependencies)
        .run(PromenadeDisplayWidgetRun)
        .directive("promenadeDisplayWidget", PromenadeDisplayWidget);

    PromenadeDisplayWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeDisplayWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget("promenadeDisplayWidget", "display");
    }

    PromenadeDisplayWidget.$inject = ["ParlayWidgetInputManager"];
    function PromenadeDisplayWidget () {
        return {
            restrict: "E",
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-display-widget.html"
        };
    }


}());