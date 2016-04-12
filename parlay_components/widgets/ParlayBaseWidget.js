function ParlayBaseWidget($mdDialog, $compile, ParlayWidgetTransformer) {
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
                        selectedItems: !!scope.selectedItems && scope.selectedItems.length >= 0 ? scope.selectedItems : [],
                        transform: !!scope.transformer ? scope.transformer.functionString : "",
                        template: scope.template,
                        widgetCompiler: compileWrapper()
                    }
                }).then(function (result) {
                    scope.initialized = true;

                    scope.configuration.selectedItems = result.selectedItems;
                    scope.configuration.transformer = new ParlayWidgetTransformer(scope, result.transformer.functionString);

                }).catch(function () {
                    if (initialize) {
                        scope.widgetsCtrl.remove(scope.$index);
                    }
                });
            };

            scope.edit(true);

        }
    };
}

angular.module("parlay.widgets.base", ["ngMaterial", "parlay.widget.transformer", "parlay.widgets.base.configuration"])
    .directive("parlayBaseWidget", ["$mdDialog", "$compile", "ParlayWidgetTransformer", ParlayBaseWidget]);