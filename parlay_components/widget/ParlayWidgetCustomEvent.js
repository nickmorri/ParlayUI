(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("parlay.widget.customevent", module_dependencies)
        .directive("parlayWidgetCustomEvent", ParlayWidgetCustomEvent);

    ParlayWidgetCustomEvent.$inject = [];
    /**
     * ParlayWidgetCustomEvent directive for registering custome events on HTMLElements.
     *
     * This directive is intended to reduce the amount of boilerplate required to define a ParlayWidget directive.
     * By using this directive a ParlayWidget definer can attach and register custom events that have widget data
     * bound to it.
     *
     * This directive depends on the usage of ParlayWidgetInput.  ParlayWidgetInput must be a directive of the highest
     * HTML element in the widget scope.  In all cases the highest root scope of a widget element will be the
     * <parlay-widget-base-card> Tag.
     *
     * @constructor module:ParlayWidgetCustomEvent.
     * @attribute {String} elementName - Name that will be used to identify the element that the directive is place on.
     * @attribute {String} baseEvent - Name of the event that should be translated into our custom event.
     * @attribute {String} event - Name of the custom event that will be launched on translation
     * @attribute {Object} model - The data that should be bound to the event object
     *
     * @example
     *
     *      <!-- attach parlay-widget-input directive here -->
     *      <parlay-widget-base-card parlay-widget-input events="['myCustomEvent']">
     *          <parlay-widget-base-card-content>
     *              <!-- attach parlay-widget-custom-event to element with default events -->
     *              <button parlay-widget-custom-event
     *                      base-event="click"
     *                      event="myCustomEvent"
     *                      model="{{item.name}}"/>
     *          </parlay-widget-base-card-content>
     *      </parlay-widget-base-card>
     *      <button parlay-widget-input events="['click']"></button>
     */
    function ParlayWidgetCustomEvent () {
        return {
            scope: true, //inherit from parent so we have all we need
            restrict: "A",
            link: function (scope, element, attrs) {
                var base_event = attrs.baseEvent;
                var translated_event = attrs.event;

                var element_ref = element[0].parentElement;

                while (element_ref.nodeName !== "PARLAY-WIDGET-BASE-CARD")
                    element_ref = element_ref.parentElement;

                element[0].addEventListener(base_event, function(){
                    var data = attrs.model;
                    var new_event = new CustomEvent(translated_event, {detail: {data: data, type: "ParlayWidgetCustomEvent"}});
                    element_ref.dispatchEvent(new_event);
                });
            }
        };
    }
}());