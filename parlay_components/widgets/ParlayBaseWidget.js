(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.widget.transformer", "parlay.widgets.base.configuration"];

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

                function compileWrapper() {
                    var scopeRef = scope;
                    var elementRef = element;

                    return function (template) {
                        if (scopeRef.template != template.template) {
                            while (elementRef[0].firstChild) {
                                angular.element(elementRef[0].firstChild).scope().$destroy();
                                elementRef[0].removeChild(elementRef[0].firstChild);
                            }

                            var childScope = scopeRef.$new();
                            var childElement = $compile(template.template)(childScope)[0];

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
                    $mdDialog.show({
                        templateUrl: "../parlay_components/widgets/directives/parlay-base-widget-configuration-dialog.html",
                        clickOutsideToClose: false,
                        controller: "ParlayBaseWidgetConfigurationDialogController",
                        controllerAs: "dialogCtrl",
                        locals: {
                            configuration: scope.configuration,
                            template: scope.template,
                            widgetCompiler: compileWrapper()
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