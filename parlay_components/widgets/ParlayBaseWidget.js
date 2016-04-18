(function () {
    "use strict";

    var module_dependencies = ["parlay.widgets.base.configuration"];

    angular
        .module("parlay.widgets.base", module_dependencies)
        .directive("parlayBaseWidget", ParlayBaseWidget);

    ParlayBaseWidget.$inject = ["$mdDialog", "$compile"];
    function ParlayBaseWidget ($mdDialog, $compile) {
        return {
            scope: true,
            restrict: "E",
            link: function (scope, element) {

                scope.initialized = false;

                scope.configuration = {};

                function compileWrapper(attributes) {
                    var scopeRef = scope;
                    var elementRef = element;

                    return function (template) {
                        if (scopeRef.template != template.name) {
                            while (elementRef[0].firstChild) {
                                angular.element(elementRef[0].firstChild).scope().$destroy();
                                elementRef[0].removeChild(elementRef[0].firstChild);
                            }

                            var snake_case = template.name.snakeCase();

                            var element_template = "<" + snake_case + " " + attributes + "></" + snake_case + ">";

                            var childScope = scopeRef.$new();
                            var childElement = $compile(element_template)(childScope)[0];

                            elementRef[0].appendChild(childElement);
                            scopeRef.template = template;

                            return {
                                childScope: childScope,
                                childElement: childElement
                            };
                        }
                    };
                }

                scope.edit = function (initialize) {

                    var attributes = [
                        ["items", "configuration.transformer.items"],
                        ["transformed-value", "configuration.transformer.value"],
                        ["widgets-ctrl", "widgetsCtrl"],
                        ["edit", "edit"],
                        ["index", "$index"]
                    ];

                    $mdDialog.show({
                        templateUrl: "../parlay_components/widgets/directives/parlay-base-widget-configuration-dialog.html",
                        clickOutsideToClose: false,
                        controller: "ParlayBaseWidgetConfigurationDialogController",
                        controllerAs: "dialogCtrl",
                        locals: {
                            configuration: scope.configuration,
                            template: scope.template,
                            container: {childScope: scope, childElement: element},
                            widgetCompiler: compileWrapper(attributes.map(function (attribute) {
                                return attribute[0] + "='" + attribute[1] + "'";
                            }).join(" "))
                        }
                    }).then(function () {
                        scope.initialized = true;
                    }).catch(function () {
                        if (initialize) {
                            scope.widgetsCtrl.remove(scope.$index);
                        }
                    });
                };

                scope.edit(true);

                scope.$on("$destroy", function () {
                    if (scope.initialized) {
                        if (!!scope.configuration.transformer) {
                            scope.configuration.transformer.cleanHandlers();
                        }
                        if (!!scope.configuration.handler) {
                            scope.configuration.handler.detach();
                        }
                    }
                });

            }
        };
    }

}());