(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.collection"];

    var module_name = "promenade.widgets.button";

    widget_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .run(PromenadeButtonWidgetRun)
        .directive("promenadeButtonWidget", PromenadeButtonWidget);

    PromenadeButtonWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeButtonWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget("promenadeButtonWidget", "input");
    }

    PromenadeButtonWidget.$inject = ["ParlayWidgetInputManager"];
    function PromenadeButtonWidget (ParlayWidgetInputManager) {
        return {
            restrict: "E",
            scope: {
                index: "=",
                items: "=",
                transformedValue: "=",
                widgetsCtrl: "=",
                edit: "="
            },
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-button-widget.html",
            link: function (scope, element) {
                var parentElement = element.find("md-card-content");
                var targetTag = "button";
                var events = ["click"];

                var registration = ParlayWidgetInputManager.registerElements("promenadeButtonWidget", parentElement, targetTag, scope, events);

                scope.tag_name = registration.parent_tag_name;
            }
        };
    }

}());