(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.manager"];

    angular
        .module("parlay.widget.canvascontroller", module_dependencies)
        .controller("ParlayWidgetCanvasController", ParlayWidgetCanvasController);

    ParlayWidgetCanvasController.$inject = ["ParlayWidgetManager"];
    function ParlayWidgetCanvasController (ParlayWidgetManager) {
        this.manager = ParlayWidgetManager;
    }

    ParlayWidgetCanvasController.prototype.getActiveWidgets = function () {
        return this.manager.getActiveWidgets();
    };

    ParlayWidgetCanvasController.prototype.add = function () {
        this.manager.add();
    };

    ParlayWidgetCanvasController.prototype.remove = function (index) {
        this.manager.remove(index);
    };
    
}());