var widgetRegistration = (function () {
    "use strict";

    var module_dependencies = ["ui.router", "ui.ace", "ngMaterial", "parlay.widget.base", "parlay.widget.canvascontroller", "parlay.settings"];

    angular
        .module("parlay.widget", module_dependencies)
        .config(ParlayWidgetsConfiguration)
        .run(ParlayWidgetsRun);

    var registered_widgets = [];

    function widgetRegistration (module_name, submodule_dependencies, directive_name, widget_type, directive_function) {
        module_dependencies.push(module_name);
        registered_widgets.push({directive_name: directive_name, widget_type: widget_type});

        angular
            .module(module_name, submodule_dependencies)
            .directive(directive_name, directive_function);

    }

    /**
     * @name WidgetsConfiguration
     * @param $stateProvider - Service provided by ui.router
     * @description - The WidgetsConfiguration sets up the items state.
     */
    function ParlayWidgetsConfiguration($stateProvider) {
        $stateProvider.state("widgets", {
            url: "/widgets",
            templateUrl: "../parlay_components/widget/views/base.html",
            controller: "ParlayWidgetCanvasController",
            controllerAs: "widgetsCtrl",
            data: {
                displayName: "Widgets",
                displayIcon: "create"
            }
        });
    }

    ParlayWidgetsRun.$inject = ["ParlaySettings", "ParlayWidgetCollection"];
    function ParlayWidgetsRun (ParlaySettings, ParlayWidgetCollection) {
        ParlaySettings.registerDefault("widgets", {editing: true});

        if (!ParlaySettings.has("widgets")) {
            ParlaySettings.restoreDefault("widgets");
        }

        ParlayWidgetCollection.registerWidgets(registered_widgets);
    }

    return widgetRegistration;
}());