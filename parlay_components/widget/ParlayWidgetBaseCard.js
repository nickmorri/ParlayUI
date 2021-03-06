(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.widget.base.menu"];

    angular
        .module("parlay.widget.base.card", module_dependencies)
        .directive("parlayWidgetBaseCard", ParlayWidgetBaseCard);

    /**
     * ParlayWidgetBaseCard directive reduces the amount of boilerplate HTML to define a ParlayWidget in the form of
     * a Angular Material [Card]{@link https://material.angularjs.org/latest/demo/card}. This directive wraps the
     * contents within the parlay-widget-base-card-title element within a md-toolbar element.
     * Within the toolbar a parlay-widget-base-menu element is included. The contents inside the
     * parlay-widget-base-card-content element are wrapped in a md-card-contents element.
     *
     * @see [AngularJS transclusion]{@link http://teropa.info/blog/2015/06/09/transclusion.html}
     * @constructor module:ParlayWidget.ParlayWidgetBaseCard
     *
     * @example
     *
     *  <parlay-widget-base-card>
     *      <parlay-widget-base-card-title>
     *          {{template.name}}{{uid}}
     *      </parlay-widget-base-card-title>
     *      <parlay-widget-base-card-content>
     *          {{transformedValue}}
     *      </parlay-widget-base-card-content>
     *  </parlay-widget-base-card>
     *
     */
    function ParlayWidgetBaseCard () {
        return {
            transclude: {
                "title": "parlayWidgetBaseCardTitle",
                "content": "parlayWidgetBaseCardContent"
            },
            restrict: "E",
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-card.html"
        };
    }
}());