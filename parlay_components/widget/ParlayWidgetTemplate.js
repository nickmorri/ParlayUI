(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.collection"];
    var module_name = "promenade.widget.template";

    angular
        .module(module_name, module_dependencies)
        .factory("ParlayWidgetTemplate", ParlayWidgetTemplateFactory);
    
    ParlayWidgetTemplateFactory.$inject = ["ParlayWidgetInputManager"];
    function ParlayWidgetTemplateFactory (ParlayWidgetInputManager) {

        function ParlayWidgetTemplate(options) {

            function defaultLink (scope) {
                scope.$parent.childLoad();
            }

            function inputRegistrationLink (scope, element) {
                var registration = ParlayWidgetInputManager.registerElements(
                    options.elementRegistration.directive_name,
                    element,
                    options.elementRegistration.parent_tag,
                    options.elementRegistration.target_tag,
                    scope,
                    options.elementRegistration.events
                );

                scope.tag_name = registration.parent_tag_name;

                defaultLink(scope, element);
            }

            function customLink (scope, element) {
                options.customLink(scope, element);
                defaultLink(scope, element);
            }

            return angular.merge({
                restrict: "E",
                scope: {
                    $index: "=",
                    items: "=",
                    transformedValue: "=",
                    widgetsCtrl: "=",
                    edit: "=",
                    editing: "="
                },
                link: !!options.elementRegistration ? inputRegistrationLink : !!options.customLink ? customLink : defaultLink
            }, options);
        }
        
        return ParlayWidgetTemplate;        
    }
    
}());