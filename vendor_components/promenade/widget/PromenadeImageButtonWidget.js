(function () {
    "use strict";
    var display_name = "Image Button";
    var module_dependencies = ["parlay.widget.input"];
    var module_name = "promenade.widget.imageButton";
    var directive_name = "promenadeWidgetImageButton";
    var widget_type = "input";

    var icon;

    PromenadeImageButtonWidgetConfigurationTabController.$inject = [];
    /**
     * Controller for the customization tab in the widget configuration dialog.
     * @constructor module:PromenadeWidget.PromenadeButtonWidget.PromenadeButtonWidgetConfigurationTabController
     */
    function PromenadeImageButtonWidgetConfigurationTabController () {}

    /**
     * Directive definition for the PromenadeButtonWidget.
     * @see [widgetRegistration]{@link module:ParlayWidget#widgetRegistration}
     */
    var directive_definition = {
        templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-image-button.html",
        customizationDefaults: {
            button_class: {
                property_name: "button_class",
                type: "text-multiple",
                value: ["md-primary", "md-raised"],
                choices: ["md-primary", "md-accent", "md-raised"]
            },
            image_height: {
                property_name: "image_height",
                type: "number",
                value: 72
            },
            image_width: {
                property_name: "image_width",
                type: "number",
                value: 72
            },
            image: {
                src: null,
                property_name: "image",
                type: "file"
            }
        }
    };

    /**
     * Configuration tab definition for the PromenadeButtonWidget.
     * @see [widgetRegistration]{@link module:ParlayWidget#widgetRegistration}
     */
    var configuration_tabs = [{
        label: "customization",
        directive_name: "buttonConfigurationTab",
        directive_function: function () {
            return {
                scope: {
                    customizations: "="
                },
                templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-button-configuration.html",
                controller: PromenadeImageButtonWidgetConfigurationTabController,
                controllerAs: "buttonCtrl"
            };
        }
    }];

    // Setting to an empty Array because we'd actually prefer to use the default and this particular configuration is
    // provided as an example.
    configuration_tabs = [];

    widgetRegistration(display_name, module_name, module_dependencies, directive_name, widget_type, directive_definition, configuration_tabs);

}());