(function() {
    "use strict";

    var module_dependencies = ["parlay.widget.manager"];

    angular
        .module("parlay.widget.editor", module_dependencies)
        .controller("ParlayWidgetEditorController", ParlayWidgetEditorController);

    ParlayWidgetEditorController.$inject = ["$scope", "$mdDialog", "$mdSidenav", "ParlayWidgetManager", "init"];
    function ParlayWidgetEditorController(scope, $mdDialog, $mdSidenav, ParlayWidgetManager, init) {

        var ctrl = this;
        ctrl.openWidgetEditor = openWidgetEditor;
        ctrl.closeWidgetEditor = closeWidgetEditor;
        ctrl.activeWidgets = activeWidgets;
        ctrl.openedWidgets = openedWidgets;
        ctrl.toggleSidenav = toggleSidenav;
        ctrl.hideSidenav = hideSidenav;
        ctrl.toggleIcon = toggleIcon;

        scope.toggled = false;

        ctrl.closeEditor = $mdDialog.hide;
        ctrl.cancelEditor = $mdDialog.cancel;
        ctrl.confirmEditor = $mdDialog.confirm;

        scope.open_widgets = [];
        var open_widgets = scope.open_widgets;

        function initWidgetEditor(init) {
            var index = open_widgets.indexOf(init);
            if (index === -1) {
                open_widgets.splice(0, 0, init);
                index = 0;
            }
            scope.selectedIndex = index;
        }


        function openWidgetEditor(widget) {
            var index = open_widgets.indexOf(widget);
            if (index === -1) {
                open_widgets.push(widget);
                index = open_widgets.length - 1;
            }
            scope.selectedIndex = index;
        }

        function closeWidgetEditor(widget) {
            var removeIndex = open_widgets.indexOf(widget);
            if (removeIndex !== -1) {
                open_widgets.splice(removeIndex, 1);
            }
        }

        function openedWidgets() {
            return open_widgets;
        }

        function activeWidgets() {
            return ParlayWidgetManager.active_widgets;
        }

        function toggleSidenav() {
            scope.toggled = !scope.toggled;
            if (!$mdSidenav('parlay-widget-editor').isLockedOpen()) {
                $mdSidenav('parlay-widget-editor').toggle();
            }
        }

        function hideSidenav() {
            return $mdSidenav('parlay-widget-editor').isLockedOpen() && scope.toggled;
        }

        function toggleIcon() {
            if (!$mdSidenav('parlay-widget-editor').isLockedOpen())
                return "keyboard_arrow_right";
            return "keyboard_arrow_" + (scope.toggled ? "right" : "left");
        }


        initWidgetEditor(init);
    }

}());