(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.collection"];
    var module_name = "promenade.widgets.button";
    var directive_name = "promenadeButtonWidget";

    widget_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .run(PromenadeButtonWidgetRun)
        .directive(directive_name, PromenadeButtonWidget);

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
                edit: "=",
                editing: "="
            },
            templateUrl: "../vendor_components/promenade/widgets/directives/promenade-button-widget.html",
            link: function (scope, element) {

                var parent_tag = "md-card-content";
                var target_tag = "button";
                var events = ["click"];

                var registration = ParlayWidgetInputManager.registerElements(directive_name, element, parent_tag, target_tag, scope, events);

                scope.tag_name = registration.parent_tag_name;

                scope.$parent.childLoad();
            }
        };
    }

}());