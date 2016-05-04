(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.base.configuration"];

    angular
        .module("parlay.widget.base", module_dependencies)
        .directive("parlayWidgetBase", ParlayWidgetBase);

    ParlayWidgetBase.$inject = ["$mdDialog", "$compile", "ParlayWidgetInputManager", "ParlayData", "ParlayWidgetTransformer"];
    function ParlayWidgetBase ($mdDialog, $compile, ParlayWidgetInputManager, ParlayData, ParlayWidgetTransformer) {
        return {
            scope: true,
            restrict: "E",
            link: function (scope, element) {

                function onChildLoad () {
                    enableDraggabilly(element[0], scope.item.position);
                    restoreHandlers(scope.item.configuration);
                    restoreTransformer(scope.item.configuration);
                    scope.initialized = true;
                }

                var attributes = [
                    ["items", "item.configuration.transformer.items"],
                    ["transformed-value", "item.configuration.transformer.value"],
                    ["widgets-ctrl", "widgetsCtrl"],
                    ["edit", "edit"],
                    ["uid", "item.uid"]
                ];

                function restore (item) {
                    compileWrapper(attributes.map(function (attribute) {
                        return attribute[0] + "='" + attribute[1] + "'";
                    }).join(" "))(angular.copy(item.configuration.template));
                }

                function restoreHandlers (configuration) {
                    if (!!configuration.selectedEvents) {
                        configuration.selectedEvents = configuration.selectedEvents.map(function (shallow_event) {
                            var actual_event = ParlayWidgetInputManager.getEvents().find(function (candidate) {
                                return candidate.element == shallow_event.element && candidate.event == shallow_event.event;
                            });

                            ParlayWidgetInputManager.registerHandler(actual_event);
                            actual_event.handler.functionString = shallow_event.handler.functionString;

                            return actual_event;
                        });
                    }
                }

                function restoreTransformer (configuration) {
                    if (!!configuration.transformer) {
                        configuration.selectedItems = configuration.selectedItems.map(function (item) {
                            return ParlayData.get(item.name);
                        });

                        var actual_transformer = new ParlayWidgetTransformer(configuration.selectedItems);
                        actual_transformer.functionString = configuration.transformer.functionString;

                        configuration.transformer = actual_transformer;
                    }
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

                    scope.$watch("widgetsCtrl.editing", function (editing) {
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
                    };
                }

                scope.edit = function (initialize) {
                    $mdDialog.show({
                        templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-dialog.html",
                        clickOutsideToClose: false,
                        controller: "ParlayWidgetBaseConfigurationDialogController",
                        controllerAs: "dialogCtrl",
                        locals: {
                            configuration: scope.item.configuration,
                            widgetCompiler: compileWrapper(attributes.map(function (attribute) {
                                return attribute[0] + "='" + attribute[1] + "'";
                            }).join(" "))
                        }
                    }).then(function (configuration) {
                        scope.initialized = true;
                        scope.item.configuration = configuration;
                    }).catch(function () {
                        if (initialize) {
                            scope.widgetsCtrl.remove(scope.uid);
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