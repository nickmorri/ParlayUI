(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.manager"];

    angular
        .module("parlay.widget.controller", module_dependencies)
        .controller("ParlayWidgetController", ParlayWidgetController)
        .directive("parlayEmptyWidgetsWorkspacePlaceholder", ParlayEmptyWidgetsWorkspacePlaceholder);

    ParlayWidgetController.$inject = ["ParlayWidgetManager"];
    function ParlayWidgetController (ParlayWidgetManager) {

        var ctrl = this;

        Object.defineProperty(ctrl, "editing", {
            get: function () {
                return ParlayWidgetManager.editing;
            }
        });
        
        ctrl.getActiveWidgets = getActiveWidgets;
        ctrl.hasWidgets = hasWidgets;
        ctrl.add = add;
        ctrl.remove = remove;
        ctrl.duplicate = duplicate;

        function getActiveWidgets () {
            return ParlayWidgetManager.getActiveWidgets();
        }
    
        function hasWidgets () {
            return ctrl.getActiveWidgets().length > 0;
        }
    
        function add () {
            ParlayWidgetManager.add();
        }
    
        function remove (uid) {
            ParlayWidgetManager.remove(uid);
        }
    
        function duplicate (uid) {
            ParlayWidgetManager.duplicate(uid);
        }
        
    }

    function ParlayEmptyWidgetsWorkspacePlaceholder () {
        return {
            templateUrl: '../parlay_components/widget/directives/parlay-empty-widget-workspace-placeholder.html'
        };
    }

}());