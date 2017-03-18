(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.inputmanager"];

    angular
        .module("parlay.widget.input", module_dependencies)
        .directive("parlayWidgetInput", ParlayWidgetInput);
    
    ParlayWidgetInput.$inject = ["ParlayWidgetInputManager"];
    /**
     * ParlayWidgetInput directive for registering events on HTMLElements.
     *
     * This directive is intended to reduce the amount of boilerplate required to define a ParlayWidget directive.
     * By using this directive a ParlayWidget definer does not have to manually interact with the
     * [ParlayWidgetInputManager]{@link module:ParlayWidget.ParlayWidgetInputManager}. A widget designer that has
     * experience with AngularJS may choose to manually register their element's event handling with the
     * [ParlayWidgetInputManager]{@link module:ParlayWidget.ParlayWidgetInputManager}.
     *
     * @constructor module:ParlayWidgetInput
     * @attribute {String} elementName - Name that will be used to identify the element that the directive is place on.
     * @attribute {String} widgetName - Name of the widget that the element is a descendant of.
     * @attribute {Number} widgetUid - Unique identifier of the widget that the element is a descendant of.
     * @attribute {Array} events - Event names that should be listened for on the element.
     *
     * @example
     *      <button parlay-widget-input events="['click']"></button>
     */
    function ParlayWidgetInput (ParlayWidgetInputManager) {
        return {
            scope: true, //inherit from parent so we have all we need
            restrict: "A",
            link: function (scope, element, attrs) {
                var events = attrs.events;

                ParlayWidgetInputManager.registerElement(
                    scope.info, element[0], scope, JSON.parse(events)
                );
            }
        };
    }

}());