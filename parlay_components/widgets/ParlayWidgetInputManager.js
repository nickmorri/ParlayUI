(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("parlay.widgets.inputmanager", module_dependencies)
        .factory("ParlayWidgetInputManager", ParlayWidgetInputManagerFactory);

    function ParlayWidgetInputManagerFactory() {

        function ParlayWidgetInputManager() {
            this.widgets = {};
        }

        function setupEventListeners(element, events) {
            return events.reduce(function (previous, current) {

                var callbacks = [];

                function listenerCallbackRef() {
                    callbacks.forEach(function (callback) {
                        callback();
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
                    clearAllListeners: clearAllListeners
                };

                element.addEventListener(current, listenerCallbackRef);
                return previous;
            }, {});
        }

        ParlayWidgetInputManager.prototype.registerElements = function (widgetName, parentElement, targetTag, scope, events) {
            var parent_tag_name = widgetName + scope.index;

            if (!this.widgets[parent_tag_name]) {
                this.widgets[parent_tag_name] = [];
            }

            Array.prototype.slice.call(parentElement.find(targetTag)).forEach(function (element) {
                this.widgets[parent_tag_name].push({
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

        ParlayWidgetInputManager.prototype.getElements = function () {
            return Object.keys(this.widgets).reduce(function (previous, current) {
                return previous.concat(this.widgets[current]);
            }.bind(this), []);
        };

        return new ParlayWidgetInputManager();
    }

}());