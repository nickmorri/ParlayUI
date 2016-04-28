(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.collection"];
    var module_name = "promenade.widget.input";
    var directive_name = "promenadeInputWidget";

    widget_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .run(PromenadeInputWidgetRun)
        .directive(directive_name, PromenadeInputWidget);

    PromenadeInputWidgetRun.$inject = ["ParlayWidgetCollection"];
    function PromenadeInputWidgetRun (ParlayWidgetCollection) {
        ParlayWidgetCollection.registerWidget(directive_name, "input");
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
                edit: "=",
                editing: "="
            },
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-input-widget.html",
            link: function (scope, element) {

                scope.$parent.childLoad();

                var parent_tag = "md-card-content";
                var target_tag = "input";
                var events = ["change", "click"];

                var registration = ParlayWidgetInputManager.registerElements(directive_name, element, parent_tag, target_tag, scope, events);

                scope.tag_name = registration.parent_tag_name;
            }
        };
    }

}());