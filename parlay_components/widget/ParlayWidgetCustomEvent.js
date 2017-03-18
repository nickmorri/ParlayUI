(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("parlay.widget.customevent", module_dependencies)
        .directive("parlayWidgetCustomEvent", ParlayWidgetCustomEvent);

    ParlayWidgetCustomEvent.$inject = [];
    function ParlayWidgetCustomEvent () {
        return {
            scope: true, //inherit from parent so we have all we need
            restrict: "A",
            link: function (scope, element, attrs) {
                var base_event = attrs.baseEvent;
                var translated_event = attrs.event;
                var data = attrs.model;

                var element_ref = element[0].parentElement;

                while (element_ref.nodeName !== "PARLAY-WIDGET-BASE-CARD")
                    element_ref = element_ref.parentElement;

                element[0].addEventListener(base_event, function(){
                    var new_event = new CustomEvent(translated_event, {details: {data: data}});
                    element_ref.dispatchEvent(new_event);
                });
            }
        };
    }

}());