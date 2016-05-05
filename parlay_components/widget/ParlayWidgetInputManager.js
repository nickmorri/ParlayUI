(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.eventhandler"];

    angular
        .module("parlay.widget.inputmanager", module_dependencies)
        .factory("ParlayWidgetInputManager", ParlayWidgetInputManagerFactory);

    ParlayWidgetInputManagerFactory.$inject = ["ParlayWidgetEventHandler"];
    function ParlayWidgetInputManagerFactory (ParlayWidgetEventHandler) {

        /**
         * @service
         * @name ParlayWidgetInputManager
         *
         * @description
         * ParlayWidgetInputManager service for managing inputs available within widgets.
         */

        function ParlayWidgetInputManager() {
            this.widgets = {};
        }

        /**
         * Adds event listeners for each event on the given element. Returns Object that allows for listener management.
         * @param {HTMLElement} element - Element that event listeners will be attached to.
         * @param {Array} events - Array of event name Strings.
         * @returns {Object} - Object that maps event name to an Object containing methods and attributes used to
         * listen to events on the given element.
         */
        function setupEventListeners(element, events) {
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
         * @param {String} widgetName - Name given to the ParlayWidget.
         * @param {HTMLElement} rootElement - Element that we should use as the root of the DOM we are interested in.
         * @param {String} parentTag - Tag name of the element that contains the target tag element(s).
         * @param {String} targetTag - Element(s) that we want to listen for the events on.
         * @param {AngularJS scope} scope - AngularJS scope that the elements are associated with.
         * @param {Array} events - Array of Strings of the event names we want to listen for.
         * @returns {{parent_tag_name: String, elements: Array}} - Registration confirmation Object.
         */
        ParlayWidgetInputManager.prototype.registerElements = function (widgetName, rootElement, parentTag, targetTag, scope, events) {
            var parentElement = rootElement.find(parentTag);
            var parent_tag_name = widgetName + scope.uid;

            if (!this.widgets[parent_tag_name]) {
                this.widgets[parent_tag_name] = [];
            }

            Array.prototype.slice.call(parentElement.find(targetTag)).forEach(function (element) {
                this.widgets[parent_tag_name].push({
                    rootElement: rootElement,
                    name: parent_tag_name + "_" + element.name,
                    type: targetTag,
                    element: element,
                    events: setupEventListeners(element, events)
                });
            }, this);

            scope.$on("$destroy", function () {
                this.widgets[parent_tag_name].forEach(function (element) {
                    Object.keys(element.events).forEach(function (key) {
                        element.events[key].clearAllListeners();
                    });
                });

                delete this.widgets[parent_tag_name];
            }.bind(this));

            return {
                parent_tag_name: parent_tag_name,
                elements: this.widgets[parent_tag_name]
            };
        };

        /**
         * Attaches ParlayWidgetEventHandler to the given Event instance.
         * @param {Event} event - HTML Event instance we should associate with a ParlayWidgetEventHandler.
         */
        ParlayWidgetInputManager.prototype.registerHandler = function (event) {
            (new ParlayWidgetEventHandler()).attach(event);
        };

        /**
         * Remove the ParlayWidgetEventHandler from the given Event instance.
         * @param {Event} event - HTML Event instance we should associate with a ParlayWidgetEventHandler.
         */
        ParlayWidgetInputManager.prototype.deregisterHandler = function (event) {
            this.getEvents().find(function (candidate) {
                return candidate === event;
            }).handler.detach();
        };

        /**
         * Returns all registered elements.
         * @returns {Array} - Registered elements.
         */
        ParlayWidgetInputManager.prototype.getElements = function () {
            return Object.keys(this.widgets).reduce(function (previous, current) {
                return previous.concat(this.widgets[current]);
            }.bind(this), []);
        };

        /**
         * Returns all registered events.
         * @returns {Array} - Registered events.
         */
        ParlayWidgetInputManager.prototype.getEvents = function () {
            return this.getElements().reduce(function (accumulator, current) {
                return accumulator.concat(Object.keys(current.events).map(function (key) {
                    current.events[key].element = current.name;
                    return current.events[key];
                }));
            }, []);
        };

        return new ParlayWidgetInputManager();
    }

}());