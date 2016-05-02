(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.manager"];

    angular
        .module("parlay.widget.canvascontroller", module_dependencies)
        .controller("ParlayWidgetCanvasController", ParlayWidgetCanvasController)
        .directive("parlayEmptyWidgetsWorkspacePlaceholder", ParlayEmptyWidgetsWorkspacePlaceholder);

    ParlayWidgetCanvasController.$inject = ["ParlayWidgetManager"];
    function ParlayWidgetCanvasController (ParlayWidgetManager) {
        this.manager = ParlayWidgetManager;
    }

    ParlayWidgetCanvasController.prototype.getActiveWidgets = function () {
        return this.manager.getActiveWidgets();
    };
    
    ParlayWidgetCanvasController.prototype.hasWidgets = function () {
        return this.getActiveWidgets().length > 0;  
    };

    ParlayWidgetCanvasController.prototype.add = function () {
        this.manager.add();
    };

    ParlayWidgetCanvasController.prototype.remove = function (index) {
        this.manager.remove(index);
    };

    function ParlayEmptyWidgetsWorkspacePlaceholder () {
        return {
            templateUrl: '../parlay_components/widget/directives/parlay-empty-widget-workspace-placeholder.html'
        };
    }
    
}());