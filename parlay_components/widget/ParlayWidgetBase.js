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

                function construct () {
                    scope.initialized = false;
                    scope.item.configuration = {};
                    scope.edit(true);
                }

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

                /**
                 * Captures variables in a closure scope that will be available to the returned Function.
                 * @returns {Function} - Attaches the specified ParlayWidget template as a child of the ParlayBaseWidget.
                 */
                function compileWrapper () {
                    var scope_ref = scope;
                    var element_ref = element;

                    // Generate a String that will be used as the element attributes that will be bound in the directive's
                    // link function to the template scope.
                    var attributes = [
                        ["items", "item.configuration.transformer.items"],
                        ["transformed-value", "item.configuration.transformer.value"],
                        ["widgets-ctrl", "widgetsCtrl"],
                        ["edit", "edit"],
                        ["uid", "item.uid"],
                        ["template", "item.configuration.template"],
                        ["customizations", "item.configuration.customizations"]
                    ].map(function (attribute) {
                        return attribute[0] + "='" + attribute[1] + "'";
                    }).join(" ");

                    /**
                     * Uses AngularJS $compile to generate HTML Element of the ParlayWidget template.
                     * @param {Object} template - ParlayBaseWidget template definition Object.
                     */
                    function templateCompiler (template) {
                        // Destroys the $scopes beneath ParlayBaseWidget element and removes the child elements before
                        // compiling any new template.
                        while (element_ref[0].firstChild) {
                            angular.element(element_ref[0].firstChild).scope().$destroy();
                            element_ref[0].removeChild(element_ref[0].firstChild);
                        }

                        // Generate snake-case template name for element tag.
                        var snake_case = template.name.snakeCase();

                        // Generate String of template name and the attribute String.
                        var element_tag_with_attributes = "<" + snake_case + " " + attributes + "></" + snake_case + ">";

                        // HTML Element of the ParlayWidget template that will be attached as a child to the ParlayBaseWidget Element.
                        var child_element = $compile(element_tag_with_attributes)(scope_ref)[0];

                        element_ref[0].appendChild(child_element);
                    }

                    return templateCompiler;
                }

                function edit (initializing) {
                    $mdDialog.show({
                        templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-dialog.html",
                        clickOutsideToClose: false,
                        controller: "ParlayWidgetBaseConfigurationDialogController",
                        controllerAs: "dialogCtrl",
                        locals: {
                            configuration: scope.item.configuration,
                            widgetCompiler: compileWrapper()
                        }
                    }).catch(function () {
                        if (initializing) {
                            scope.widgetsCtrl.remove(scope.uid);
                        }
                    });
                }

                // If an existing configuration Object exists we should restore the configuration, otherwise construct
                // from scratch.
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