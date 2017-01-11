(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.widget.base.configuration", "parlay.items.search", "parlay.widget.controller", "parlay.items.manager", "parlay.item.persistence"];

    angular
        .module("parlay.widget.base", module_dependencies)
        .directive("parlayWidgetBase", ParlayWidgetBase);

    ParlayWidgetBase.$inject = ["$mdDialog", "$compile", "$interval", "ParlayWidgetInputManager", "ParlayData", "ParlayWidgetTransformer", "widgetLastZIndex", "ParlayItemManager", "ParlayItemPersistence"];
    /**
     * Base directive of a ParlayWidget. Repeated inside the widget workspace and contains the chosen compiled widget
     * template.
     *
     * @constructor module:ParlayWidget.ParlayWidgetBase
     * @param {Object} $mdDialog - Angular [$mdDialog]{@link https://material.angularjs.org/latest/api/service/$mdDialog} service.
     * @param {Object} $compile - AngularJS [$compile]{@link https://docs.angularjs.org/api/ng/service/$compile} service.
     * @param {Object} $interval - AngularJS [$interval]{@link https://docs.angularjs.org/api/ng/service/$interval} service.
     * @param {Object} ParlayWidgetInputManager - [ParlayWidgetInputManager]{@link module:ParlayWidget.ParlayWidgetInputManager} service.
     * @param {Object} ParlayData - [ParlayData]{@link module:ParlayData} service.
     * @param {Object} ParlayWidgetTransformer - [ParlayWidgetTransformer]{@link module:ParlayWidget.ParlayWidgetTransformer} factory.
     * @param {Object} widgetLastZIndex - zIndex of the highest ParlayWidget.
     */
    function ParlayWidgetBase ($mdDialog, $compile, $interval, ParlayWidgetInputManager, ParlayData, ParlayWidgetTransformer, widgetLastZIndex, ParlayItemManager, ParlayItemPersistence) {
        return {
            scope: true,
            restrict: "E",
            /**
             * @member module:ParlayWidget.ParlayWidgetBase#link
             * @param {Object} scope - AngularJS [$scope]{@link https://docs.angularjs.org/guide/scope} Object.
             * @param {Boolean} scope.initialized - True if the template has been selected and compiled, false otherwise.
             * @param {Function} scope.edit - Launches the widget configuration $mdDialog.
             * @param {Number} scope.item.uid - Unique ID assigned by the ParlayWidgetController and used by ng-repeat track by.
             * @param {Object} scope.item.position - Coordinates of the last position of the widget.
             * @param {Object} scope.item.configuration - Holds user selected configuration details used to define behavior and appearence
             * of the widget.
             * @param {Object} scope.item.configuration.template - Widget template selected by the user during the configuration process.
             * @param {Array} scope.item.configuration.template.configuration_tabs - @see {@link module:ParlayWidget#widgetRegistration} for more information.
             * @param {String} scope.item.configuration.template.name - Widget name used for identification.
             * @param {String} scope.item.configuration.template.type - Widget type, can be display or input.
             * @param {ParlayWidgetEventHandler} scope.item.configuration.handler - [ParlayWidgetEventHandler]{@link module:ParlayWidget.ParlayWidgetEventHandler} instance.
             * @param {ParlayWidgetTransformer} scope.item.configuration.transformer - [ParlayWidgetTransformer]{@link module:ParlayWidget.ParlayWidgetTransformer} instance.
             * @param {HTMLElement} element - Element the directive created and link is attache to.
             */
            link: function (scope, element) {

                /**
                 * Reference to the [Draggabilly]{@link http://draggabilly.desandro.com/} instance that is attached to the element.
                 * @member module:ParlayWidget.ParlayWidgetBase#draggie
                 * @private
                 */
                var draggie;

                // Attach the methods to scope.
                scope.edit = edit;

                // Handle widget initialization on parlayWidgetTemplateLoaded event.
                scope.$on("parlayWidgetTemplateLoaded", function () {
                    onLoaded(element[0]);
                });

                // Handle widget initialization on parlayWidgetBaseCardLoaded event.
                scope.$on("parlayWidgetBaseCardLoaded", function (event, element) {
                    onLoaded(element[0].parentElement.parentElement);
                });

                // Handle widget initialization on parlayItemCardLoaded event
                scope.$on("parlayItemCardLoaded", function (event, element) {
                    onLoaded(element[0].parentElement);
                });

                // Handle $destroy event.
                scope.$on("$destroy", function () {

                    if (scope.initialized && !!scope.item.configuration) {
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


                // If an existing configuration Object exists we should restore the configuration, otherwise construct
                // from scratch.

                if (!!scope.item.configuration) {
                    compileWrapper()(angular.copy(scope.item.configuration.template));
                } else if (!!scope.item.id) {
                    compileItem()(ParlayItemManager.getItemByID(scope.item.id));
                } else if (scope.item.type === "StandardItem") {
                    scope.initialized = false;
                    compileItem()(scope.item.item);
                } else {
                    scope.initialized = false;
                    scope.item.configuration = {};
                    scope.item.name = ""; // this turns into scope.info.name in widgettemplate
                    scope.edit(true);
                }

                /**
                 * Event handler for loaded events emitted from ParlayWidgets.
                 * @member module:ParlayWidget.ParlayWidgetBase#onLoaded
                 * @private
                 * @param {HTMLElement} drag_element - Element that the Draggabilly will attach to.
                 */
                function onLoaded (drag_element) {
                    enableDraggabilly(drag_element, scope.item.position);
                    restoreHandlers(scope.item.configuration);
                    restoreTransformer(scope.item.configuration);
                    initPosition(drag_element);
                    scope.initialized = true;
                }

                function initPosition(element) {

                    var DOMElement = angular.element(element);

                    scope.item.position = {
                        left: parseInt(DOMElement.prop('offsetLeft'), 10) + "px",
                        top: parseInt(DOMElement.prop('offsetTop'), 10) + "px"
                    };
                }

                /**
                 * Reattaches event handlers from a previous session to the equivalent input events on this session.
                 * @member module:ParlayWidget.ParlayWidgetBase#restoreHandlers
                 * @private
                 * @param {Array} configuration.selected_events - User selected element events that should have handlers reattached.
                 */
                function restoreHandlers (configuration) {
                    if (!configuration)
                        return;

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

                /**
                 * Reattaches transformation function and selected item data sources from a previous session.
                 * @member module:ParlayWidget.ParlayWidgetBase#restoreHandlers
                 * @private
                 * @param {Array} configuration.selectedItems
                 * @param {ParlayWidgetTransformer} configuration.transformer
                 */
                function restoreTransformer (configuration) {
                    if (!configuration)
                        return;

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
                 * @member module:ParlayWidget.ParlayWidgetBase#enableDraggabilly
                 * @private
                 * @param {HTMLElement} element - ParlayWidget element to attach a Draggabilly instance to.
                 * @param {Object} [initialPosition] - Optional position that we should set the ParlayWidget to.
                 */
                function enableDraggabilly (element, initialPosition) {

                    // If a Draggabilly instance already exists we should destroy it.
                    if (!!draggie) {
                        draggie.destroy();
                    }

                    // Create a Draggabilly instance for the given element. If a handle CSS class is included on any
                    // child element we should use that as the handle. Contain widget dragging to enclosing div with
                    // .view-container class.

                    draggie = new Draggabilly(element, {
                        handle: ".handle",
                        containment: ".view-container"
                    });

                    // Record the position of the card when dragging ends.
                    draggie.on("dragEnd", function () {
                        scope.item.position = {
                            left: element.style.left,
                            top: element.style.top,
                        };
                        scope.item.zIndex = parseInt(angular.element(element)[0].style.zIndex, 10);
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
                            if (angular.element(element)[0].style.zIndex === "" || parseInt(angular.element(element)[0].style.zIndex, 10) < widgetLastZIndex.value) {
                                angular.element(element)[0].style.zIndex = ++widgetLastZIndex.value;
                            }

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
                        element.style.left = scope.item.position.left;
                        element.style.top = scope.item.position.top;
                        angular.element(element)[0].style.zIndex = scope.item.zIndex;
                    }

                    // If the widgetsCtrl is editing the user should be free to rearrange ParlayWidgets, otherwise
                    // the widgets should not be draggable.
                    scope.$watch("widgetsCtrl.editing", function (editing) {
                        if (editing) {
                            draggie.enable();
                        } else {
                            draggie.disable();
                        }
                    });

                }

                /**
                 * Captures variables in a closure scope that will be available to the returned Function.
                 * @member module:ParlayWidget.ParlayWidgetBase#compileWrapper
                 * @private
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
                        ["customizations", "item.configuration.customizations"],
                        ["info", "item"],

                    ].map(function (attribute) {
                        return attribute[0] + "='" + attribute[1] + "'";
                    }).join(" ");

                    /**
                     * Uses AngularJS [$compile]{@link https://docs.angularjs.org/api/ng/service/$compile} to generate
                     * HTML Element of the ParlayWidget template.
                     * @member module:ParlayWidget.ParlayWidgetBase#templateCompiler
                     * @private
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
                        var child_element = $compile(element_tag_with_attributes)(scope_ref.$new())[0];

                        element_ref[0].appendChild(child_element);
                    }
                    return templateCompiler;
                }


                function compileItem() {
                    var scope_ref = scope;
                    var element_ref = element;

                    var attributes = [
                        ["edit", "edit"],
                        ["uid", "item.uid"],
                        ["widgets-ctrl", "widgetsCtrl"],
                    ].map(function (attribute) {
                        return attribute[0] + "='" + attribute[1] + "'";
                    }).join(" ");

                    function itemCompiler(item) {
                        var container = {};
                        container.uid = scope.item.uid;
                        container.ref = item;

                        scope.item.id = item.id;

                        if (!!scope.item.stored_values)
                            container.stored_values = scope.item.stored_values;

                        while (element_ref[0].firstChild) {
                            angular.element(element_ref[0].firstChild).scope().$destroy();
                            element_ref[0].removeChild(element_ref[0].firstChild);
                        }

                        var itemElement = "<parlay-item-card " + attributes + " ></parlay-item-card>";
                        var new_scope = scope_ref.$new();

                        new_scope.container = container;

                        var child_element =  $compile(itemElement)(new_scope)[0];

                        element_ref[0].appendChild(child_element);
                        element_ref.attr("style", "top: 0%;");

                        scope.initialized = true;
                    }
                    return itemCompiler;
                }

                /**
                 * Launches the widget configuration dialog with a reference to the configuration Object to allow the
                 * user to configure the widget.
                 * @member module:ParlayWidget.ParlayWidgetBase#edit
                 * @public
                 * @param {Boolean} initializing - True if the widget was just created, false otherwise. For example if
                 * the user hit the edit button.
                 */
                function edit (initializing) {
                    $mdDialog.show({
                        templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-dialog.html",
                        clickOutsideToClose: true,
                        controller: "ParlayWidgetBaseConfigurationDialogController",
                        controllerAs: "dialogCtrl",
                        locals: {
                            item: scope.item,
                            widgetCompiler: compileWrapper()
                        }
                    }).catch(function () {
                        // If the widget was just created and the dialog was canceled we should remove the widget.
                        if (initializing) {
                            scope.widgetsCtrl.remove(scope.item.uid);
                        }
                    });
                }
            }
        };
    }
}());