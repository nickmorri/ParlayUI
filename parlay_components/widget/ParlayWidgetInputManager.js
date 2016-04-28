(function () {
    "use strict";

    var module_dependencies = ["parlay.widget.eventhandler"];

    angular
        .module("parlay.widget.inputmanager", module_dependencies)
        .factory("ParlayWidgetInputManager", ParlayWidgetInputManagerFactory);

    ParlayWidgetInputManagerFactory.$inject = ["ParlayWidgetEventHandler"];
    function ParlayWidgetInputManagerFactory (ParlayWidgetEventHandler) {

        function ParlayWidgetInputManager() {
            this.widgets = {};
        }

        function setupEventListeners(element, events) {
            return events.reduce(function (previous, current) {

                var callbacks = [];

                function listenerCallbackRef(event) {
                    callbacks.forEach(function (callback) {
                        callback(event);
                    });
                }

                function registerListener(callback) {
                    callbacks.push(callback);
                }

                function removeListener(callback) {
                    callbacks.splice(callbacks.indexOf(callback), 1);
                }

                function clearAllListeners() {
                    callbacks = [];
                    element.removeEventListener(current, listenerCallbackRef);
                }

                previous[current] = {
                    event: current,
                    addListener: registerListener,
                    removeListener: removeListener,
                    clearAllListeners: clearAllListeners,
                    handler: null
                };

                element.addEventListener(current, listenerCallbackRef);
                return previous;
            }, {});
        }

        ParlayWidgetInputManager.prototype.registerElements = function (widgetName, rootElement, parentTag, targetTag, scope, events) {
            var parentElement = rootElement.find(parentTag);
            var parent_tag_name = widgetName + scope.index;

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

        ParlayWidgetInputManager.prototype.registerHandler = function (event) {
            (new ParlayWidgetEventHandler()).attach(event);
        };

        ParlayWidgetInputManager.prototype.deregisterHandler = function (event) {
            this.getEvents().find(function (candidate) {
                return candidate === event;
            }).handler.detach();
        };

        ParlayWidgetInputManager.prototype.getElements = function () {
            return Object.keys(this.widgets).reduce(function (previous, current) {
                return previous.concat(this.widgets[current]);
            }.bind(this), []);
        };

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