(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.widget.base.configuration"];

    angular
        .module("parlay.widget.base", module_dependencies)
        .directive("parlayWidgetBase", ParlayWidgetBase);

    ParlayWidgetBase.$inject = ["$mdDialog", "$compile", "$interval", "ParlayWidgetInputManager", "ParlayData", "ParlayWidgetTransformer"];
    function ParlayWidgetBase ($mdDialog, $compile, $interval, ParlayWidgetInputManager, ParlayData, ParlayWidgetTransformer) {
        return {
            scope: true,
            restrict: "E",
            link: function (scope, element) {

                var draggie;
                
                scope.edit = edit;

                scope.$on("parlayWidgetTemplateLoaded", function () {
                    enableDraggabilly(element[0], scope.item.position);
                    restoreHandlers(scope.item.configuration);
                    restoreTransformer(scope.item.configuration);
                    scope.initialized = true;
                });

                scope.$on("parlayWidgetBaseCardLoaded", function (event, element) {
                    enableDraggabilly(element[0].parentElement.parentElement, scope.item.position);
                    restoreHandlers(scope.item.configuration);
                    restoreTransformer(scope.item.configuration);
                    scope.initialized = true;
                });

                scope.$on("$destroy", function () {
                    if (scope.initialized) {
                        if (!!scope.item.configuration.transformer) {
                            scope.item.configuration.transformer.cleanHandlers();
                        }
                        if (!!scope.item.configuration.handler) {
                            scope.item.configuration.handler.detach();
                        }
                    }
                    if (!!draggie) {
                        draggie.destroy();
                    }
                });

                function restore (item) {
                    compileWrapper()(angular.copy(item.configuration.template));
                }

                function restoreHandlers (configuration) {
                    if (!!configuration.selectedEvents) {
                        configuration.selectedEvents = configuration.selectedEvents.map(function (shallow_event) {

                            var actual_event = ParlayWidgetInputManager.getEvents(element).filter(function (candidate) {
                                return candidate.handler === null;
                            }).find(function (candidate) {
                                return (
                                    candidate.element.widget_name == shallow_event.element.widget_name &&
                                    candidate.element.element_name == shallow_event.element.element_name &&
                                    candidate.event == shallow_event.event
                                );
                            });

                            if (!actual_event) {
                                return shallow_event;
                            }

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

                /**
                 * Allows the user to reposition the ParlayWidget freely in the workspace.
                 * @param {HTMLElement} element - ParlayWidget element to attach a Draggabilly instance to.
                 * @param {Object} [initialPosition] - Optional position that we should set the ParlayWidget to.
                 */
                function enableDraggabilly (element, initialPosition) {

                    // If a Draggabilly instance already exists we should destroy it.
                    if (!!draggie) {
                        draggie.destroy();
                    }

                    // Create a Draggabilly instance for the given element. If a handle CSS class is included on any
                    // child element we should use that as the handle.
                    draggie = new Draggabilly(element, {
                        handle: ".handle"
                    });

                    // Record the position of the card when dragging ends.
                    draggie.on("dragEnd", function () {
                        scope.item.position = this.position;
                    });

                    // If the widget is a card we should add some feedback during dragging.
                    var card = angular.element(element).find("md-card");
                    if (!!card) {
                        // Dropping animation.
                        draggie.on("dragEnd", function () {
                            var height = 24;
                            var promise = $interval(function () {
                                if (height == 1) {
                                    $interval.cancel(promise);
                                }
                                else {
                                    card[0].classList.remove("md-whiteframe-" + (height + 1) + "dp");
                                    card[0].classList.add("md-whiteframe-" + height + "dp");
                                    height--;
                                }
                            }, 2);
                        });

                        // Picking up animation.
                        draggie.on("dragStart", function () {
                            var height = 1;
                            var promise = $interval(function () {
                                if (height == 24) {
                                    $interval.cancel(promise);
                                }
                                else {
                                    card[0].classList.remove("md-whiteframe-" + (height - 1) + "dp");
                                    card[0].classList.add("md-whiteframe-" + height + "dp");
                                    height++;
                                }
                            }, 5);
                        });
                    }

                    // If an initialPosition is given we should move the widget to that location.
                    if (!!initialPosition) {
                        draggie.dragPoint = initialPosition;
                        draggie.positionDrag();
                    }

                    // If the widgetsCtrl is editing the user should be free to rearrange ParlayWidgets, otherwise
                    // the widgets should not be draggable.
                    scope.$watch("widgetsCtrl.editing", function (editing) {
                        if (editing) {
                            draggie.enable();
                        }
                        else {
                            draggie.disable();
                        }
                    });

                }

                function compileWrapper () {
                    var scopeRef = scope;
                    var elementRef = element;

                    var attributes = [
                        ["items", "item.configuration.transformer.items"],
                        ["transformed-value", "item.configuration.transformer.value"],
                        ["widgets-ctrl", "widgetsCtrl"],
                        ["edit", "edit"],
                        ["uid", "item.uid"],
                        ["template", "item.configuration.template"],
                        ["options", "item.configuration.options"]
                    ].map(function (attribute) {
                        return attribute[0] + "='" + attribute[1] + "'";
                    }).join(" ");

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
                    };
                }

                function edit (initialize) {
                    $mdDialog.show({
                        templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-dialog.html",
                        clickOutsideToClose: false,
                        controller: "ParlayWidgetBaseConfigurationDialogController",
                        controllerAs: "dialogCtrl",
                        locals: {
                            configuration: scope.item.configuration,
                            widgetCompiler: compileWrapper()
                        }
                    }).then(function () {
                        scope.initialized = true;
                    }).catch(function () {
                        if (initialize) {
                            scope.widgetsCtrl.remove(scope.uid);
                        }
                    });
                }

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