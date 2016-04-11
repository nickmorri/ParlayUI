function ParlayWidgetInputManagerFactory() {
    "use strict";

    function ParlayWidgetInputManager() {
        this.widgets = {};
    }

    ParlayWidgetInputManager.prototype.registerElements = function (widgetName, parentElement, targetTag, scope, events) {
        var parent_tag_name = widgetName + scope.$index;

        if (!this.widgets[parent_tag_name]) {
            this.widgets[parent_tag_name] = [];
        }

        Array.prototype.slice.call(parentElement.find(targetTag)).forEach(function (element) {
            this.widgets[parent_tag_name].push({
                name: parent_tag_name + "_" + element.name,
                type: targetTag,
                element: element,
                events: events
            });
        }, this);

        scope.$on("$destroy", function () {
            delete this.widgets[parent_tag_name];
        }.bind(this));

        return parent_tag_name;
    };

    ParlayWidgetInputManager.prototype.getElements = function () {
        return Object.keys(this.widgets).reduce(function (previous, current) {
            return previous.concat(this.widgets[current]);
        }.bind(this), []);
    };

    return new ParlayWidgetInputManager();
}

angular.module("parlay.widgets.inputmanager", [])
    .factory("ParlayWidgetInputManager", ParlayWidgetInputManagerFactory);