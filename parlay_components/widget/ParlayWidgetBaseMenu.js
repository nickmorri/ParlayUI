(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "ngMdIcons"];
    
    angular
        .module("parlay.widget.base.menu", module_dependencies)
        .directive("parlayWidgetBaseMenu", ParlayWidgetBaseMenu);

    /**
     * ParlayWidgetBaseMenu directive that contains a typical <md-menu> element used in a ParlayWidget.
     * @constructor module:ParlayWidget:ParlayWidgetBaseMenu
     *
     * @example
     *
     *  <parlay-widget-base-menu></parlay-widget-base-menu>
     *
     */
    
    function ParlayWidgetBaseMenu () {
        return {
            restrict: "E",
            require: "^widgetsCtrl",
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-menu.html"
        };
    }

}());