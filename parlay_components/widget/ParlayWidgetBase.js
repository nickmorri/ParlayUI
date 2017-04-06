(function () {
    "use strict";

    var module_dependencies = ["ngMaterial", "parlay.widget.base.configuration", "parlay.items.search",
        "parlay.widget.controller", "parlay.items.manager", "parlay.item.persistence", "parlay.widget.manager"];

    angular
        .module("parlay.widget.base", module_dependencies)
        .directive("parlayWidgetBase", ParlayWidgetBase);

    ParlayWidgetBase.$inject = ["$mdDialog", "$timeout", "$compile", "$interval", "ParlayWidgetInputManager", "ParlayData",
        "ParlayWidgetTransformer", "widgetLastZIndex", "ParlayItemManager", "ParlayWidgetManager"];
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
    function ParlayWidgetBase ($mdDialog, $timeout, $compile, $interval, ParlayWidgetInputManager, ParlayData,
                               ParlayWidgetTransformer, widgetLastZIndex, ParlayItemManager, ParlayWidgetManager) {
        /**
         * @member module:ParlayWidget.ParlayWidgetBase#link
         * @param {Object} scope - AngularJS [$scope]{@link https://docs.angularjs.org/guide/scope} Object.
         * @param {Boolean} scope.initialized - True if the template has been selected and compiled, false otherwise.
         * @param {Function} scope.edit - Launches the widget configuration $mdDialog.
         * @param {Object} scope.item - Widget Object wrapper containing UID and template info
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
                if (!scope.item.configuration.properties)
                    scope.item.configuration.properties = properties;
            });

            // Handle $destroy event.
            scope.$on("$destroy", function () {

                if (!!scope.item.configuration) {
                    if (!!scope.item.configuration.transformer)
                        scope.item.configuration.transformer.cleanHandlers();

                    if (!!scope.item.configuration.handler)
                        scope.item.configuration.handler.detach();
                }
                if (!!draggie) {
                    draggie.destroy();
                }
            });

            // if someone else changes my zIndex store, update the element's zindex value
            scope.$watch("item.zIndex", function(newVal) {
                element[0].style.zIndex = newVal;
            });


            // hide the element if the position is not already established.  It will unhide once the compilation
            // of the element is complete
            if (!scope.item.position)
                element[0].style.left = element[0].style.top = "-100000" + "px";

            if (scope.item.widget.name === "promenadeStandardItem") {
                // if the container object has a reference to the ParlayItem id, then create the item
                // If there are stored values that need to be restored, the itemCompiler will handle that
                compileItem()(ParlayItemManager.getItemByID(scope.item.widget.id));
            } else {
                // If a configuration Object does not exist, create widget from scratch
                if (angular.equals(scope.item.configuration, {}))
                    configureWidget();
                compileWrapper()(scope.item.configuration.template);
            }

            // Wait for digest loop to complete to get accurate dimensions of cards
            $timeout(function() {
                onLoaded();
            });


            /**
             * initialize the widget's configuration object for advanced features
             */
            function configureWidget() {
                scope.item.configuration.selectedEvents = [];
                scope.item.configuration.selectedItems = [];
                scope.item.configuration.template = scope.item.widget;
                if (scope.item.widget.type === "display")
                    scope.item.configuration.transformer = new ParlayWidgetTransformer();
            }

            /**
             * Event handler for loaded events emitted from ParlayWidgets.
             * @member module:ParlayWidget.ParlayWidgetBase#onLoaded
             * @private
             */
            function onLoaded () {
                initEventHandler();
                initPosition();
                enableDraggabilly();
                restoreHandlers(scope.item.configuration);
                restoreTransformer(scope.item.configuration);
            }

            /**
             * initialize the event handler of the widget by attaching a default event as well as any helper scripts available
             */
            function initEventHandler() {
                var widget = scope.item.widget;

                if (widget.type !== "input")
                    return;

                var availableEvents = ParlayWidgetInputManager.getEvents(element);
                if (availableEvents.length > 0 && scope.item.configuration.selectedEvents.length === 0) {
                    scope.item.configuration.selectedEvents.push(availableEvents[0]);
                    ParlayWidgetInputManager.registerHandler(availableEvents[0]);

                    if (!!widget.api_helper && !!scope.item.widget.api_helper.local_data) {
                        scope.item.configuration.selectedEvents[0].handler.functionString += widget.api_helper.local_data;
                    }

                    if (!!scope.item.widget.script) {
                        scope.item.configuration.selectedEvents[0].handler.functionString += widget.script + "\n";
                        delete widget.script;
                    }

                    scope.item.configuration.selectedEvents[0].handler.functionString += "\n";
                }
            }

            /**
             * returns true if two widgets intersect
             * @param widget1
             * @param widget2
             * @returns {boolean}
             */
            function widgetsIntersect(widget1, widget2) {
                return ((widget1.x + widget1.w) > widget2.x) && (widget1.x < (widget2.x + widget2.w)) &&
                    ((widget1.y + widget1.h) > widget2.y) && (widget1.y < (widget2.y + widget2.h));
            }


            /**
             * Given the coordinates of the view container of all the widgets, return the spot where this widget would
             * perfectly fit
             * @param viewContainerPosition
             * @returns {*}
             */
            function findEmptySpot(viewContainerPosition) {

                function coordinateSort(a,b) {
                    return a - b;
                }

                var active_widgets = document.querySelectorAll("parlay-widget-base");
                var x_coords = [viewContainerPosition.left];
                var y_coords = [viewContainerPosition.top];

                for (var w = 0; w < active_widgets.length; w++) {
                    if (active_widgets[w].offsetLeft < 0)
                        continue;

                    x_coords.push(active_widgets[w].offsetLeft);
                    x_coords.push(active_widgets[w].offsetLeft + active_widgets[w].offsetWidth);
                    y_coords.push(active_widgets[w].offsetTop);
                    y_coords.push(active_widgets[w].offsetTop + active_widgets[w].offsetHeight);
                }

                x_coords.sort(coordinateSort);
                y_coords.sort(coordinateSort);

                x_coords = new Set(x_coords);
                y_coords = new Set(y_coords);

                for (var y_vals = y_coords.keys(), y = y_vals.next().value; y !== undefined; y = y_vals.next().value) {
                    for (var x_vals = x_coords.keys(), x = x_vals.next().value; x !== undefined; x = x_vals.next().value) {
                        var intersections = 0;
                        for (var z = 0; z < active_widgets.length; z++) {
                            if (active_widgets[z].offsetLeft < 0)
                                continue;

                            var this_widget = {
                                x: x,
                                y: y,
                                w: element[0].offsetWidth,
                                h: element[0].offsetHeight
                            };

                            var compare_widget = {
                                x: active_widgets[z].offsetLeft,
                                y: active_widgets[z].offsetTop,
                                w: active_widgets[z].offsetWidth,
                                h: active_widgets[z].offsetHeight
                            };

                            if (widgetsIntersect(this_widget, compare_widget)) {
                                intersections++;
                                break;
                            }
                        }
                        if (((x + element[0].offsetWidth) > viewContainerPosition.right) ||
                            ((y + element[0].offsetHeight) > viewContainerPosition.bottom))
                            continue;

                        if (intersections === 0) {
                            return {
                                left: x + "px",
                                top: y + "px"
                            };
                        }
                    }
                }
                return undefined;
            }

            /**
             * given any element, return the elements dimensions/coordinates
             * @param element
             * @returns {{left, top: (Number|number), right: *, bottom: *}}
             */
            function getViewContainerDimensions() {
                var viewContainer = document.querySelector(".view-container");
                var heightStyle = viewContainer.style.height;
                return {
                    left: 0,
                    top: 0,
                    right: viewContainer.offsetWidth,
                    bottom: heightStyle === "" ? viewContainer.offsetHeight : parseInt(heightStyle, 10)
                };

            }

            /**
             * on construction of the widget element, initialize the position of the element.
             * if a spot cannot be found during initialization, the view container is expanded
             */
            function initPosition() {
                // if a position already exists, don't initialize it
                if (!scope.item.position) {
                    var viewContainer = document.querySelector(".view-container");
                    var viewContainerPosition = getViewContainerDimensions();
                    if (ParlayWidgetManager.getActiveWidgets().length === 1) {
                        scope.item.position = {
                            left: 0 + "px",
                            top: 0 + "px"
                        };
                    } else {
                        var empty_spot = findEmptySpot(viewContainerPosition);

                        while (!empty_spot) {
                            var oldHeight = viewContainerPosition.bottom;
                            var oldWidth = viewContainer.right;

                            if (viewContainer.hasAttribute("flex")) {
                                viewContainer.removeAttribute("flex");
                                viewContainer.classList.remove("flex");
                            }

                            viewContainer.style.height = (oldHeight * 2) + "px";
                            if (viewContainer.style.width === "")
                                viewContainer.style.width = oldWidth + "px";

                            viewContainerPosition = getViewContainerDimensions();
                            empty_spot = findEmptySpot(viewContainerPosition);
                        }
                        scope.item.position = empty_spot;
                    }
                }
                element[0].style.left = scope.item.position.left;
                element[0].style.top = scope.item.position.top;
            }


            /**
             * touchTranslate given a touch event will translate the event into a related mouse event
             * @param event
             * @returns {Event}
             */
            function touchTranslate(event) {
                var translated;
                switch (event.type) {
                    case "touchstart":
                        translated = "mousedown";
                        break;
                    case "touchend":
                    case "touchcancel":
                        translated = "mouseup";
                        break;
                    case "touchmove":
                        translated = "mousemove";
                        break;
                }

                var positioning = event.changedTouches[0];
                return new MouseEvent(translated, {
                    clientX: positioning.clientX,
                    clientY: positioning.clientY,
                    screenX: positioning.screenX,
                    screenY: positioning.screenY,
                    pageX: positioning.pageX,
                    pageY: positioning.pageY
                });
            }

            /**
             * Any time a touch event gets registered by draggie, convert it into a mouse event
             * and dispatch the event to the window.  Prevent the default behavior of the touch event
             * @param event
             */
            function handleTouchEvent(event) {
                event.preventDefault();
                var mouse_event = touchTranslate(event);
                window.dispatchEvent(mouse_event);
            }

            /**
             * If the user is running Android version of Chrome, we need to override the
             * touch events that get registered with the draggie instance.  Touch start already gets
             * converted to mousedown so we only need to re-register touch end, cancel and move
             */
            function handleDragAndroidChrome() {
                if (!(/android/i.test(navigator.userAgent) && /chrome/i.test(navigator.userAgent)))
                    return;
                var touch_events = ["touchend", "touchcancel", "touchmove"];
                touch_events.forEach(function(touch_event) {
                    element[0].addEventListener(touch_event, handleTouchEvent);
                });
            }



            /**
             * Allows the user to reposition the ParlayWidget freely in the workspace.
             * @member module:ParlayWidget.ParlayWidgetBase#enableDraggabilly
             * @private
             * @param {HTMLElement} element - ParlayWidget element to attach a Draggabilly instance to.
             * @param {Object} [initialPosition] - Optional position that we should set the ParlayWidget to.
             */
            function enableDraggabilly () {

                // If a Draggabilly instance already exists we should destroy it.
                if (!!draggie) {
                    draggie.destroy();
                }

                // Create a Draggabilly instance for the given element. If a handle CSS class is included on any
                // child element we should use that as the handle. Contain widget dragging to enclosing div with
                // .view-container class.
                draggie = new Draggabilly(element[0], {
                    handle: ".handle",
                    containment: ".view-container"
                });

                // If the user is running chrome on android, override the touch events with mouse events
                handleDragAndroidChrome();

                // Function handler to store position coordinates when a drag ends
                function dragEnd() {
                    scope.item.position = {
                        left: element[0].style.left,
                        top: element[0].style.top
                    };
                }

                // Function handler to process animation of card dropping
                function dropAnimation(event) {
                    // Dont do animation if the clicked element is the menu
                    if (event.srcElement.nodeName === "MD-ICON")
                        return;

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
                }

                // Function handler to process animation of card being picked up
                function pickUpAnimation(event) {
                    // Dont do animation if the clicked element is the menu
                    if (event.srcElement.nodeName === "MD-ICON")
                        return;

                    var height = 1;

                    var active_widgets = ParlayWidgetManager.active_widgets;
                    for (var i = 0; i < active_widgets.length; i++) {
                        if (active_widgets[i].zIndex > scope.item.zIndex) {
                            active_widgets[i].zIndex--;
                        }
                    }

                    scope.item.zIndex = widgetLastZIndex.value;
                    element[0].style.zIndex = scope.item.zIndex;

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
                }

                // Record the position of the card when dragging ends.
                draggie.on("dragEnd", dragEnd);
                // If the widget is a card we should add some feedback during dragging.
                var card = angular.element(element[0]).find("md-card");
                if (!!card) {
                    // Dropping animation.
                    draggie.on("pointerUp", dropAnimation);
                    // Picking up animation.
                    draggie.on("pointerDown", pickUpAnimation);
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
            link: linkFn
        };
    }
}());