(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.eventhandler", "parlay.data"];

    angular
        .module("parlay.widget.inputmanager", module_dependencies)
        .factory("ParlayWidgetInputManager", ParlayWidgetInputManagerFactory);

    ParlayWidgetInputManagerFactory.$inject = ["ParlayWidgetEventHandler", "ParlayData"];
    function ParlayWidgetInputManagerFactory (ParlayWidgetEventHandler, ParlayData) {

        /**
         * ParlayWidgetInputManager service for managing inputs available within widgets.
         * @constructor module:ParlayWidget.ParlayWidgetInputManager
         */

        function ParlayWidgetInputManager() {
            /**
             * Collection of active input widgets.
             * @member module:ParlayWidget.ParlayWidgetInputManager#
             * @public
             * @type {Object}
             */
            this.widgets = {};
        }

        /**
         * Adds event listeners for each event on the given element. Returns Object that allows for listener management.
         * @member module:ParlayWidget.ParlayWidgetInputManager#setupEventListeners
         * @private
         * @param {HTMLElement} element - Element that event listeners will be attached to.
         * @param {Array} events - Array of event name Strings.
         * @returns {Object} - Object that maps event name to an Object containing methods and attributes used to
         * listen to events on the given element.
         */
        function setupEventListeners (element, events) {
            // Process every event in the events Array and return an Object mapping event -> Object (event listener
            // management).
            return events.reduce(function (previous, current) {

                // Array that lives in the closure scope which contains the functions that are called on event.
                var callbacks = [];

                /**
                 * Call each callback and pass it the event instance when the event occurs.
                 * @param {Event} event - A DOM event.
                 */
                function listenerCallbackRef (event) {
                    callbacks.forEach(function (callback) {
                        callback(event);
                    });
                }

                /**
                 * Registers the given callback function so it is called on event.
                 * @param {Function} callback - Function to be called when event occurs.
                 */
                function registerListener (callback) {
                    callbacks.push(callback);
                }

                /**
                 * Remove a callback that has been previously registered.
                 * @param {Function} callback - Function to be called when event occurs.
                 */
                function removeListener (callback) {
                    callbacks.splice(callbacks.indexOf(callback), 1);
                }

                /**
                 * Set the closure scope callback Array to an empty Array clearing the references to the callbacks
                 * then remove the event listener from the HTMLElement.
                 */
                function clearAllListeners () {
                    callbacks = [];
                    element.removeEventListener(current, listenerCallbackRef);
                }

                // Create listener management Object.
                previous[current] = {
                    event: current,
                    addListener: registerListener,
                    removeListener: removeListener,
                    clearAllListeners: clearAllListeners,
                    handler: null
                };

                // Add the event listener to the HTMLElement.
                element.addEventListener(current, listenerCallbackRef);
                return previous;
            }, {});
        }

        /**
         * Register event listeners for each event for every element that match the target tag beneath the parent tag Object
         * contained within the DOM of the rootElement.
         * @member module:ParlayWidget.ParlayWidgetInputManager#registerElement
         * @public
         * @param {String} widget_name - Name given to the ParlayWidget.
         * @param {String} widget_uid - Unique ID assigned to ParlayWidget.
         * @param {HTMLElement} element - Element that we should attach event listeners to.
         * @param {Object} scope - AngularJS [$scope]{@link https://docs.angularjs.org/guide/scope} Object
         * @param {Array} events - Array of Strings of the event names we want to listen for.
         */
        ParlayWidgetInputManager.prototype.registerElement = function (widget_info, element, scope, events) {

            var registration = {
                uid: widget_info.uid,
                //widget_info: widget_info,
                element_ref: element,
                events: setupEventListeners(element, events)
            };

            if (!this.widgets[widget_info.uid]) {
                this.widgets[widget_info.uid] = [registration];
            }
            else {
                this.widgets[widget_info.uid].push(registration);
            }

            scope.$on("$destroy", function () {
                Object.keys(registration.events).forEach(function (key) {
                    registration.events[key].clearAllListeners();
                });
                delete this.widgets[widget_info.uid];
            }.bind(this));

        };


        /**
         * Attaches ParlayWidgetEventHandler to the given Event instance.
         * @member module:ParlayWidget.ParlayWidgetInputManager#registerHandler
         * @public
         * @param {Event} event - HTML Event instance we should associate with a ParlayWidgetEventHandler.
         */
        ParlayWidgetInputManager.prototype.registerHandler = function (event) {
            var handler = new ParlayWidgetEventHandler();
            handler.attach(event);
        };

        /**
         * Remove the ParlayWidgetEventHandler from the given Event instance.
         * @member module:ParlayWidget.ParlayWidgetInputManager#deregisterHandler
         * @public
         * @param {Event} event - HTML Event instance we should associate with a ParlayWidgetEventHandler.
         */
        ParlayWidgetInputManager.prototype.deregisterHandler = function (event) {
            var handler = this.getEvents().find(function (candidate) {
                return candidate === event;
            }).handler;
            handler.detach();
        };

        /**
         * Returns all registered elements.
         * @member module:ParlayWidget.ParlayWidgetInputManager#getElements
         * @public
         * @param {HTMLElement} [parent] - If given only descendants of element will be returned.
         * @returns {Array} - Registered elements.
         */
        ParlayWidgetInputManager.prototype.getElements = function (parent) {
            var elements = Object.keys(this.widgets).reduce(function (accumulator, key) {
                return accumulator.concat(this.widgets[key]);
            }.bind(this), []);

            return !!parent ? elements.filter(function (element) {
                return parent[0].contains(element.element_ref);
            }) : elements;
        };

        /**
         * Returns all registered events.
         * @member module:ParlayWidget.ParlayWidgetInputManager#getEvents
         * @public
         * @param {HTMLElement} [parent] - Optional parameter, if given elements will be filtered.
         * @returns {Array} - Registered events.
         */
        ParlayWidgetInputManager.prototype.getEvents = function (parent) {
            return this.getElements(parent).reduce(function (accumulator, current) {
                return accumulator.concat(Object.keys(current.events).map(function (key) {
                    return current.events[key];
                }).map(function (event) {
                    event.element = {
                        uid:  current.uid,

                    };
                    return event;
                }));
            }, []);
        };

        ParlayWidgetInputManager.prototype.getWidgetInfo = function(uid)
        {

        };


        return new ParlayWidgetInputManager();
    }

}());