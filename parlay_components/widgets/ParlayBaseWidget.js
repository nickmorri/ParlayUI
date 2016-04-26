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

                function onChildLoad () {
                    enableDraggabilly(element[0], scope.item.position);
                }

                var attributes = [
                    ["items", "configuration.transformer.items"],
                    ["transformed-value", "configuration.transformer.value"],
                    ["widgets-ctrl", "widgetsCtrl"],
                    ["edit", "edit"],
                    ["index", "$index"],
                    ["editing", "editing"]
                ];

                function restore (item) {
                    scope.initialized = true;
                    scope.$index = item.index;
                    compileWrapper(attributes.map(function (attribute) {
                        return attribute[0] + "='" + attribute[1] + "'";
                    }).join(" "))(item.template);
                }

                function construct () {
                    scope.initialized = false;
                    scope.item.configuration = {};
                    scope.edit(true);
                }

                function enableDraggabilly (element, initialPosition) {
                    var draggie = new Draggabilly(element, {
                        grid:[20, 20],
                        handle: ".handle"
                    });

                    draggie.on("dragEnd", function () {
                        scope.item.position = this.position;
                    });

                    if (!!initialPosition) {
                        draggie.dragPoint = initialPosition;
                        draggie.positionDrag();
                    }

                    scope.$watch("editing", function (editing) {
                        if (editing) {
                            draggie.enable();
                        }
                        else {
                            draggie.disable();
                        }
                    });

                }

                function compileWrapper (attributes) {
                    var scopeRef = scope;
                    var elementRef = element;

                    return function (template) {
                        while (elementRef[0].firstChild) {
                            angular.element(elementRef[0].firstChild).scope().$destroy();
                            elementRef[0].removeChild(elementRef[0].firstChild);
                        }

                        var snake_case = template.name.snakeCase();

                        var element_template = "<" + snake_case + " " + attributes + "></" + snake_case + ">";

                        var childScope = scopeRef.$new();
                        var childElement = $compile(element_template)(childScope)[0];

                        elementRef[0].appendChild(childElement);
                        childScope.childLoad = onChildLoad;
                        scopeRef.item.template = template;

                        return {
                            childScope: childScope,
                            childElement: childElement
                        };
                    };
                }

                scope.edit = function (initialize) {

                    $mdDialog.show({
                        templateUrl: "../parlay_components/widgets/directives/parlay-base-widget-configuration-dialog.html",
                        clickOutsideToClose: false,
                        controller: "ParlayBaseWidgetConfigurationDialogController",
                        controllerAs: "dialogCtrl",
                        locals: {
                            configuration: scope.item.configuration,
                            template: scope.item.template,
                            container: {childScope: scope, childElement: element},
                            widgetCompiler: compileWrapper(attributes.map(function (attribute) {
                                return attribute[0] + "='" + attribute[1] + "'";
                            }).join(" "))
                        }
                    }).then(function (configuration) {
                        scope.initialized = true;
                        scope.item.configuration = configuration;
                    }).catch(function () {
                        if (initialize) {
                            scope.widgetsCtrl.remove(scope.$index);
                        }
                    });
                };

                scope.$on("$destroy", function () {
                    if (scope.initialized) {
                        if (!!scope.item.configuration.transformer) {
                            scope.item.configuration.transformer.cleanHandlers();
                        }
                        if (!!scope.item.configuration.handler) {
                            scope.item.configuration.handler.detach();
                        }
                    }
                });

                scope.$watch("$index", function ($index) {
                    scope.item.index = $index;
                });

                if (!!scope.item.configuration) {
                    restore(scope.item);
                }
                else {
                    construct();
                }

            }
        };
    }

}());