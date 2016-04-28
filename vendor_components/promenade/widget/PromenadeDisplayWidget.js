(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.collection"];
    var module_name = "promenade.widget.display";
    var directive_name = "promenadeDisplayWidget";

    widget_dependencies.push(module_name);

    angular
        .module(module_name, module_dependencies)
        .run(PromenadeDisplayWidgetRun)
        .directive(directive_name, PromenadeDisplayWidget);

    PromenadeDisplayWidgetRun.$inject = ["ParlayWidgetCollection"];
    function PromenadeDisplayWidgetRun (ParlayWidgetCollection) {
        ParlayWidgetCollection.registerWidget(directive_name, "display");
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
            templateUrl: "../vendor_components/promenade/widget/directives/promenade-display-widget.html",
            link: function (scope, element) {
                scope.$parent.childLoad();
            }
        };
    }

}());