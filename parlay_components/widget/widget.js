var widgetRegistration = (function () {
    "use strict";

    /**
     * A ParlayWidget can be defined by a developer to allow their end-users to easily put together a reconfigurable
     * and reusable interface composed of custom HTML and JavaScript.
     * @module ParlayWidget
     */

    var module_dependencies = ["ui.router", "ui.ace", "ngMaterial", "parlay.widget.base", "parlay.widget.collection",
        "parlay.widget.controller", "parlay.settings", "parlay.data"];

    angular
        .module("parlay.widget", module_dependencies)
        .config(ParlayWidgetsConfiguration)
        .run(ParlayWidgetsRun);

    // Holds record Objects that for all widgets available to the end-user.
    var registered_widgets = [];

    /**
     * Registers the widget module and ensures that it is a dependency of parlay.widget.
     * @member module:ParlayWidget#widgetRegistration
     * @param {String} module_name - Name of the module the widget to be registered belongs to.
     * @param {Array} submodule_dependencies - All dependencies the widget requires.
     * @param {String} directive_name - Name of the widget directive to be registered.
     * @param {String} widget_type - Type of the widget to be registered. Available types: display or input.
     * @param {Object|Function} directive_definition - Directive definition Object or Function that defines the widget.
     * @param {String} directive_definition.templateUrl - Path to the widget HTML template.
     * @param {Object} [directive_definition.customizationDefaults] - Describes which customizations are available for
     * the widget.
     * @param {String} directive_definition.customizationDefaults.*.property_name - Name of the customization property,
     * should be the same as the key in the customizationDefaults Object.
     * @param {String} directive_definition.customizationDefaults.*.type - Type of customization. Available types: text,
     * text-multiple, and color.
     * @param {*} directive_definition.customizationDefaults.*.value - User selected value, a default should be provided.
     * @param {Array} [directive_definition.customizationDefaults.*.choices] - Array of acceptable values for the
     * customization.
     * @param {Object[]} [configuration_tabs] - Objects that contain definitions for vendor provided configuration tabs.
     * @param {String} configuration_tabs[].label - Text to fill md-tab-label element with.
     * @param {String} configuration_tabs[].directive_name - Directive name.
     * @param {Function} configuration_tabs[].directive_function - Factory function for creating new instance of directives.
     *
     * @example
     *
     * var module_name = "vendor.widgets";
     * var submodule_dependencies = ["vendor.datasource"];
     * var directive_name = "vendorWidgetExample";
     * var widget_type = "display";
     * var directive_definition = {
     *      templateUrl: "../vendor_components/vendor/widget/directives/vendor-widget-example.html",
     *      customizationDefaults: {
     *          example_text: {
     *              property_name: "example_text",
     *              type: "text",
     *              value: "foo"
     *          },
     *          example_class: {
     *              property_name: "example_class",
     *              type: "text-multiple",
     *              value: ["md-primary", "md-raised"],
     *              choices: ["md-primary", "md-accent", "md-raised"]
     *          },
     *          example_text_color: {
     *              property_name: "example_text_color",
     *              type: "color",
     *              value: "#fff"
     *          }
     *      }
     * };
     * var configuration_tabs = [{
     *      label: "customization",
     *      directive_name: "exampleConfigurationTab",
     *      directive_function: function () {
     *          return {
     *              scope: {
     *                  customizations: "="
     *              },
     *              templateUrl: "../vendor_components/vendor/widget/directives/vendor-widget-example-configuration.html",
     *              controller: VendorExampleWidgetConfigurationTabController,
     *              controllerAs: "exampleCtrl"
     *          };
     *      }
     * }];
     * 
     * widgetRegistration(module_name, module_dependencies, directive_name, widget_type, directive_definition, configuration_tabs);
     *
     */
    function widgetRegistration (display_name, module_name, submodule_dependencies, directive_name, widget_type, directive_definition, configuration_tabs) {
        // Ensure that parlay.widget includes the given module as a dependency.
        module_dependencies.push(module_name);

        // Register the record Object for the given widget.
        registered_widgets.push({display_name:display_name,  directive_name: directive_name, widget_type: widget_type, configuration_tabs: configuration_tabs});

        var directive_function;

        // directive_definition can be an Object or a Function. If it is a Function we assume all configuration has been
        // done by the user. If it is a Object we assume that the user wants us to extend their widget using
        // ParlayWidgetTemplate.
        if (angular.isFunction(directive_definition)) {
            directive_function = directive_definition;
        }
        else {
            directive_function = function (ParlayWidgetTemplate) {
                return new ParlayWidgetTemplate(directive_definition, display_name);
            };

            directive_function.$inject = ["ParlayWidgetTemplate"];

            submodule_dependencies.push("parlay.widget.template","parlay.data");
        }

        var module = angular.module(module_name, submodule_dependencies); 
        
        // Register the widget module with AngularJS.
        module.directive(directive_name, directive_function);

        // If the widget has configuration tabs that should be shown in the widget configuration dialog register them.
        if (!!configuration_tabs) {
            configuration_tabs.forEach(function (tab) {
                module.directive(tab.directive_name, tab.directive_function); 
            });
        }

    }

    /**
     * @name WidgetsConfiguration
     * @param $stateProvider - Service provided by ui.router
     * @description - The WidgetsConfiguration sets up the widgets state.
     */
    ParlayWidgetsConfiguration.$inject = ["$stateProvider"];
    function ParlayWidgetsConfiguration ($stateProvider) {
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

    ParlayWidgetsRun.$inject = ["ParlaySettings", "ParlayWidgetCollection", "ParlayData"];
    function ParlayWidgetsRun (ParlaySettings, ParlayWidgetCollection, ParlayData) {
        ParlayData.set('registered_widget_types', registered_widgets);
        console.log(ParlayData);

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