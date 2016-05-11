(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.inputmanager"];

    angular
        .module("parlay.widget.input", module_dependencies)
        .directive("parlayWidgetInput", ParlayWidgetInput);

    ParlayWidgetInput.$inject = ["ParlayWidgetInputManager"];
    function ParlayWidgetInput (ParlayWidgetInputManager) {
        return {
            scope: {
                elementName: "@",
                widgetName: "@",
                events: "@"
            },
            restrict: "A",
            link: function (scope, element) {
                ParlayWidgetInputManager.registerElement(
                    scope.widgetName, scope.elementName, element[0], scope, JSON.parse(scope.events)
                );
            }
        };
    }

}());