(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.collection"];

    var module_name = "promenade.widgets.input";

    widget_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .run(PromenadeInputWidgetRun)
        .directive("promenadeInputWidget", PromenadeInputWidget);

    PromenadeInputWidgetRun.$inject = ["ParlayWidgetsCollection"];
    function PromenadeInputWidgetRun (ParlayWidgetsCollection) {
        ParlayWidgetsCollection.registerWidget("promenadeInputWidget", "input");
    }

    PromenadeInputWidget.$inject = ["ParlayWidgetInputManager"];
    function PromenadeInputWidget (ParlayWidgetInputManager) {
        return {
            restrict: "E",
            scope: {
                index: "=",
                items: "=",
                transformedValue: "=",
                widgetsCtrl: "=",
                edit: "="
            },
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-input-widget.html",
            link: function (scope, element) {
                var parentElement = element.find("md-card-content");
                var targetTag = "input";
                var events = ["change"];

                var registration = ParlayWidgetInputManager.registerElements("promenadeInputWidget", parentElement, targetTag, scope, events);

                scope.tag_name = registration.parent_tag_name;
            }
        };
    }

}());