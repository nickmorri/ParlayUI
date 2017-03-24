(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.widget.base.configuration", "parlay.items.search", "parlay.widget.controller", "parlay.items.manager", "parlay.item.persistence"];

    angular
        .module("parlay.widget.base", module_dependencies)
        .directive("parlayWidgetBase", ParlayWidgetBase);

    ParlayWidgetBase.$inject = ["$window", "$mdDialog", "$compile", "$interval", "ParlayWidgetInputManager", "ParlayData", "ParlayWidgetTransformer", "widgetLastZIndex", "ParlayItemManager", "ParlayItemPersistence"];
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
    function ParlayWidgetBase ($window, $mdDialog, $compile, $interval, ParlayWidgetInputManager, ParlayData, ParlayWidgetTransformer, widgetLastZIndex, ParlayItemManager) {
        function linkFn(scope, element) {

            /**
             * Reference to the [Draggabilly]{@link http://draggabilly.desandro.com/} instance that is attached to the element.
             * @member module:ParlayWidget.ParlayWidgetBase#draggie
             * @private
             */
            var draggie;

            // Attach the methods to scope.
            scope.edit = edit;

            // Handle widget initialization on parlayWidgetTemplateLoaded event.
            scope.$on("parlayWidgetTemplateLoaded", function (event, properties) {
                // Keep track of properties if a templated widget has them
                if (!scope.item.configuration.properties) {
                    scope.item.configuration.properties = properties;
                }
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

                if (!!scope.item.configuration) {
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


            // If an existing configuration Object exists we should restore the configuration
            if (!!scope.item.configuration) {
                compileWrapper()(angular.copy(scope.item.configuration.template));
            } else if (scope.item.widget.name === "promenadeStandardItem") {
                // if the container object has a reference to the ParlayItem id, then create the item
                // If there are stored values that need to be restored, the itemCompiler will handle that
                var itemToCompile = ParlayItemManager.getItemByID(scope.item.widget.id);
                compileItem()(itemToCompile);
            } else {
                // if all else fails, then we should be adding a widget from scratch
                scope.item.configuration = {};
                scope.item.name = ""; // this turns into scope.info.name in widgettemplate
                initConfig();
                compileWrapper()(scope.item.configuration.template);
            }

            /**
             * Event handler for loaded events emitted from ParlayWidgets.
             * @member module:ParlayWidget.ParlayWidgetBase#onLoaded
             * @private
             * @param {HTMLElement} drag_element - Element that the Draggabilly will attach to.
             */
            function onLoaded (drag_element) {
                initPosition(drag_element);
                enableDraggabilly(drag_element, scope.item.position);
                restoreHandlers(scope.item.configuration);
                restoreTransformer(scope.item.configuration);
            }

            function initPosition(element) {
                // if a position already exists, don't initialize it
                if (!!scope.item.position) return;

                var DOMElement = angular.element(element);
                var leftOffset = (parseInt(DOMElement.prop('offsetLeft'), 10));

                var left = ParlayData.get("widget_left_position");
                var top = ParlayData.get("widget_top_position");

                scope.item.position = {
                    left: (leftOffset + left) + "px",
                    top: top + "px"
                };

                var setLeft = left + 10;
                var setTop = top + 10;

                if (setLeft + leftOffset > $window.innerWidth - 400) {
                    var iter = ParlayData.get("widget_iterations") + 1;
                    setLeft = 20;
                    setTop = 20 * iter;
                    ParlayData.set("widget_iterations", iter);
                }

                ParlayData.set("widget_left_position", setLeft);
                ParlayData.set("widget_top_position", setTop);
            }

            function initConfig() {
                scope.item.configuration.selectedEvents = [];
                scope.item.configuration.selectedItems = [];
                scope.item.configuration.template = scope.item.widget;
                if (scope.item.widget.type === "display")
                    scope.item.configuration.transformer = new ParlayWidgetTransformer();
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
                if (!configuration) return;

                if (!!configuration.transformer) {
                    configuration.selectedItems = configuration.selectedItems.map(function (item) {
                        return ParlayData.get(item.item_id + "." + item.name);
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
                    draggie.on("pointerUp", function () {
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
                    draggie.on("pointerDown", function () {
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
                    if (editing)
                        draggie.enable();
                    else
                        draggie.disable();
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

                var scope_params = [
                    ["items", "item.configuration.transformer.items"],
                    ["transformed-value", "item.configuration.transformer.value"],
                    ["widgets-ctrl", "widgetsCtrl"],
                    ["edit", "edit"],
                    ["uid", "item.uid"],
                    ["template", "item.configuration.template"],
                    ["customizations", "item.configuration.customizations"],
                    ["properties", "item.configuration.properties"],
                    ["info", "item"]
                ];

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

                    // Generate Angular Element of template name.
                    var element_to_compile = angular.element("<" + snake_case + " " +"></" + snake_case + ">");

                    // Bind attributes to the element scope
                    for (var i = 0; i < scope_params.length; i++) {
                        element_to_compile.attr(scope_params[i][0], scope_params[i][1]);
                    }

                    // HTML Element of the ParlayWidget template that will be attached as a child to the ParlayBaseWidget Element.
                    element_ref[0].appendChild($compile(element_to_compile)(scope_ref.$new())[0]);
                }
                return templateCompiler;
            }


            function compileItem() {
                var scope_ref = scope;
                var element_ref = element;

                function itemCompiler(item) {
                    var container = {};
                    container.uid = scope.item.uid;
                    container.ref = item;

                    if (!!scope.item.stored_values) {
                        container.stored_values = scope.item.stored_values;
                    }

                    while (element_ref[0].firstChild) {
                        angular.element(element_ref[0].firstChild).scope().$destroy();
                        element_ref[0].removeChild(element_ref[0].firstChild);
                    }

                    var new_scope = scope_ref.$new();
                    new_scope.container = container;
                    element_ref[0].appendChild($compile("<parlay-item-card></parlay-item-card>")(new_scope)[0]);
                }
                return itemCompiler;
            }

            /**
             * Launches the widget configuration dialog with a reference to the configuration Object to allow the
             * user to configure the widget.
             * @member module:ParlayWidget.ParlayWidgetBase#edit
             * @public
             */
            function edit () {
                $mdDialog.show({
                    templateUrl: "../parlay_components/widget/directives/parlay-widget-base-configuration-dialog.html",
                    clickOutsideToClose: false,
                    controller: "ParlayWidgetBaseConfigurationDialogController",
                    controllerAs: "dialogCtrl",
                    locals: {
                        item: scope.item
                    }
                });
            }
        }

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
            link: linkFn
        };
    }
}());