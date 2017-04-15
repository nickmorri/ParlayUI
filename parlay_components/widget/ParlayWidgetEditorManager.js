(function() {
    "use strict";

    var module_dependencies = ["parlay.widget.manager"];

    angular
        .module("parlay.widget.editormanager", module_dependencies)
        .factory("ParlayWidgetEditorManager", ParlayWidgetEditorManagerFactory);

    ParlayWidgetEditorManagerFactory.$inject = ["ParlayWidgetManager"];
    function ParlayWidgetEditorManagerFactory(ParlayWidgetManager) {

        function ParlayWidgetEditorManager() {

            this.opened_widgets = [];
            this.toggled = false;

        }

        ParlayWidgetEditorManager.prototype.initWidgetEditor = function(initWidget) {
            var index = this.opened_widgets.indexOf(initWidget);
            if (index === -1) {
                this.opened_widgets.splice(0, 0, initWidget);
                index = 0;
            }
            return index;
        };

        ParlayWidgetEditorManager.prototype.openWidgetEditor = function(widget) {
            var index = this.opened_widgets.indexOf(widget);
            if (index === -1) {
                this.opened_widgets.push(widget);
                index = this.opened_widgets.length - 1;
            }
            return index;
        };

        ParlayWidgetEditorManager.prototype.closeWidgetEditor = function(widget) {
            var removeIndex = this.opened_widgets.indexOf(widget);
            if (removeIndex !== -1) {
                this.opened_widgets.splice(removeIndex, 1);
            }
        };

        ParlayWidgetEditorManager.prototype.sanitize = function() {
            var i = this.opened_widgets.length;
            while(--i !== -1) {
                if (ParlayWidgetManager.active_widgets.indexOf(this.opened_widgets[i]) === -1)
                    this.opened_widgets.splice(i, 1);
            }
        };
        return new ParlayWidgetEditorManager();
    }

}());