(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.input"];
    var module_name = "promenade.widget.button";
    var directive_name = "promenadeWidgetButton";
    var widget_type = "input";


    ButtonConfigurationTabController.$inject = ["$scope"];
    function ButtonConfigurationTabController ($scope) {

    }

    var directive_definition = {
        templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-button.html",
        customizationDefaults: {
            button_text: {
                property_name: "button_text",
                type: "text",
                value: "click!"
            },
            button_class: {
                property_name: "button_class",
                type: "text-multiple",
                value: ["md-primary", "md-raised"],
                choices: ["md-primary", "md-accent", "md-raised"]
            },
            button_text_color: {
                property_name: "button_text_color",
                type: "color",
                value: "#fff"
            }
        }
    };

    var configuration_tabs = [{
        label: "customization",
        directive_name: "buttonConfigurationTab",
        directive_function: function () {
            return {
                scope: {
                    customizations: "="
                },
                templateUrl: "../vendor_components/promenade/widget/directives/promenade-widget-button-configuration.html",
                controller: ButtonConfigurationTabController,
                controllerAs: "buttonCtrl"
            };
        }
    }];

    // Setting to an empty Array because we'd actually prefer to use the default and this particular configuration is
    // provided as an example.
    configuration_tabs = [];

    widgetRegistration(module_name, module_dependencies, directive_name, widget_type, directive_definition, configuration_tabs);

}());