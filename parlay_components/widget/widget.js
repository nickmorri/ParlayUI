var widgetRegistration = (function () {
    "use strict";

    var module_dependencies = ["ui.router", "ui.ace", "ngMaterial", "parlay.widget.base", "parlay.widget.controller", "parlay.settings"];

    angular
        .module("parlay.widget", module_dependencies)
        .config(ParlayWidgetsConfiguration)
        .run(ParlayWidgetsRun);

    // Holds record Objects that for all widgets available to the end-user.
    var registered_widgets = [];

    /**
     * Registers the widget module and ensures that it is a dependency of parlay.widget.
     * @param {String} module_name
     * @param {Array} submodule_dependencies
     * @param {String} directive_name
     * @param {String} widget_type
     * @param {Function} directive_function
     */
    function widgetRegistration (module_name, submodule_dependencies, directive_name, widget_type, directive_function) {
        // Ensure that parlay.widget includes the given module as a dependency.
        module_dependencies.push(module_name);

        // Register the record Object for the given widget.
        registered_widgets.push({directive_name: directive_name, widget_type: widget_type});

        // Register the widget module with AngularJS.
        angular
            .module(module_name, submodule_dependencies)
            .directive(directive_name, directive_function);
    }

    /**
     * @name WidgetsConfiguration
     * @param $stateProvider - Service provided by ui.router
     * @description - The WidgetsConfiguration sets up the widgets state.
     */
    function ParlayWidgetsConfiguration($stateProvider) {
        $stateProvider.state("widgets", {
            url: "/widgets",
            templateUrl: "../parlay_components/widget/views/base.html",
            controller: "ParlayWidgetController",
            controllerAs: "widgetsCtrl",
            data: {
                displayName: "Widgets",
                displayIcon: "create"
            }
        });
    }

    ParlayWidgetsRun.$inject = ["ParlaySettings", "ParlayWidgetCollection"];
    function ParlayWidgetsRun (ParlaySettings, ParlayWidgetCollection) {
        // Register the default ParlaySettings for widgets.
        ParlaySettings.registerDefault("widgets", {editing: true});

        // If ParlayWidget doesn't have any existing settings for widgets set to default.
        if (!ParlaySettings.has("widgets")) {
            ParlaySettings.restoreDefault("widgets");
        }

        ParlayWidgetCollection.registerWidgets(registered_widgets);
    }

    return widgetRegistration;
}());