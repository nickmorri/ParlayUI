(function() {
    "use strict";

    var module_dependencies = ["parlay.widget.manager", "parlay.widget.editormanager"];

    angular
        .module("parlay.widget.editor", module_dependencies)
        .controller("ParlayWidgetEditorController", ParlayWidgetEditorController);

    ParlayWidgetEditorController.$inject = ["$scope", "$mdDialog", "$mdSidenav", "ParlayWidgetManager",
        "ParlayWidgetEditorManager", "init"];
    function ParlayWidgetEditorController(scope, $mdDialog, $mdSidenav, ParlayWidgetManager, ParlayWidgetEditorManager, init) {

        var ctrl = this;
        ctrl.openWidgetEditor = openWidgetEditor;
        ctrl.closeWidgetEditor = closeWidgetEditor;
        ctrl.activeWidgets = activeWidgets;
        ctrl.openedWidgets = openedWidgets;
        ctrl.toggleSidenav = toggleSidenav;
        ctrl.hideSidenav = hideSidenav;
        ctrl.toggleIcon = toggleIcon;

        ctrl.closeEditor = $mdDialog.hide;
        ctrl.cancelEditor = $mdDialog.cancel;

        function initWidgetEditor(init) {
            ParlayWidgetEditorManager.sanitize();
            scope.selectedIndex = ParlayWidgetEditorManager.initWidgetEditor(init);
        }


        function openWidgetEditor(widget) {
            scope.selectedIndex = ParlayWidgetEditorManager.openWidgetEditor(widget);
        }

        function closeWidgetEditor(widget) {
            ParlayWidgetEditorManager.closeWidgetEditor(widget);
        }

        function openedWidgets() {
            return ParlayWidgetEditorManager.opened_widgets;
        }

        function activeWidgets() {
            return ParlayWidgetManager.active_widgets;
        }

        function toggleSidenav() {
            ParlayWidgetEditorManager.toggled = !ParlayWidgetEditorManager.toggled;
            if (!$mdSidenav('parlay-widget-editor').isLockedOpen()) {
                $mdSidenav('parlay-widget-editor').toggle();
            }
        }

        function hideSidenav() {
            return $mdSidenav('parlay-widget-editor').isLockedOpen() && ParlayWidgetEditorManager.toggled;
        }

        function toggleIcon() {
            if (!$mdSidenav('parlay-widget-editor').isLockedOpen())
                return "keyboard_arrow_right";
            return "keyboard_arrow_" + (ParlayWidgetEditorManager.toggled ? "right" : "left");
        }

        initWidgetEditor(init);
    }

}());