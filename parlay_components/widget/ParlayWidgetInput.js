(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.inputmanager"];

    angular
        .module("parlay.widget.input", module_dependencies)
        .directive("parlayWidgetInput", ParlayWidgetInput);

    /**
     * @directive
     * @name ParlayWidgetInput
     *
     * @description
     * ParlayWidgetInput directive for registering events on HTMLElements.
     *
     * This directive is intended to reduce the amount of boilerplate required to define a ParlayWidget directive.
     * By using this directive a ParlayWidget definer does not have to manually interact with the
     * ParlayWidgetInputManager. A widget designer that has experience with AngularJS may choose to manually register
     * their element's event handling with the ParlayWidgetInputManager.
     *
     * @attribute {String} elementName - Name that will be used to identify the element that the directive is place on.
     * @attribute {String} widgetName - Name of the widget that the element is a descendant of.
     * @attribute {Number} widgetUid - Unique identifier of the widget that the element is a descendant of.
     * @attribute {Array} events - Event names that should be listened for on the element.
     *
     * @example
     *
     * <button parlay-widget-input widget-name='{{template.name}}' widget-uid='{{uid}}' element-name='test' events="['click']"></button>
     *
     */

    ParlayWidgetInput.$inject = ["ParlayWidgetInputManager"];
    function ParlayWidgetInput (ParlayWidgetInputManager) {
        return {
            scope: {
                elementName: "@",
                widgetName: "@",
                widgetUid: "@",
                events: "@"
            },
            restrict: "A",
            link: function (scope, element) {
                ParlayWidgetInputManager.registerElement(
                    scope.widgetName, parseInt(scope.widgetUid, 10), scope.elementName, element[0], scope, JSON.parse(scope.events)
                );
            }
        };
    }

}());