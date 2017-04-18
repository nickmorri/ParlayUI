(function() {
    "use strict";

    var module_dependencies = ["parlay.widget.manager", "parlay.widget.editormanager", "parlay.common.genericpopup"];

    angular
        .module("parlay.widget.editor", module_dependencies)
        .directive("parlayWidgetEditor", ParlayWidgetEditor)
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
        ctrl.hideHelper = hideHelper;
        ctrl.toggleIcon = toggleIcon;
        ctrl.widgetHasProps = widgetHasProps;
        ctrl.showHelper = showHelper;
        ctrl.onEditorLoad = onEditorLoad;

        ctrl.closeEditor = $mdDialog.hide;
        ctrl.cancelEditor = $mdDialog.cancel;

        scope.showHelper = false;


        function initWidgetEditor(init) {
            ParlayWidgetEditorManager.sanitize();
            if (!!init)
                scope.selectedIndex = ParlayWidgetEditorManager.initWidgetEditor(init);
        }

        function widgetHasProps(widget) {
            return Object.keys(widget.configuration.properties).length > 0;
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

        function hideHelper() {
            scope.showHelper = false;
        }

        function toggleIcon() {
            if (!$mdSidenav('parlay-widget-editor').isLockedOpen())
                return "keyboard_arrow_right";
            return "keyboard_arrow_" + (ParlayWidgetEditorManager.toggled ? "right" : "left");
        }

        function showHelper(widget) {
            scope.name = widget.name;
            scope.script = widget.configuration.template.api_helper.property;
            scope.script = scope.script.split("{name}").join("\"" + widget.name + "\"");
            scope.showHelper = true;
        }

        function onEditorLoad(editor) {
            editor.$blockScrolling = Infinity;
            ace.require("ace/ext/language_tools");
            editor.setReadOnly(true);
        }

        initWidgetEditor(init);
    }

    function ParlayWidgetEditor() {
        return {
            controller: "ParlayWidgetEditorController",
            controllerAs: "editCtrl",
            restrict: "E"
        };
    }


}());