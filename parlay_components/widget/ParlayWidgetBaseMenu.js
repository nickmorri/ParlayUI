(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "ngMdIcons"];
    
    angular
        .module("parlay.widget.base.menu", module_dependencies)
        .directive("parlayWidgetBaseMenu", ParlayWidgetBaseMenu);
    
    function ParlayWidgetBaseMenu () {
        return {
            restrict: "E",
            require: "^widgetsCtrl",
            templateUrl: "../parlay_components/widget/directives/parlay-widget-base-menu.html"
        };
    }

}());