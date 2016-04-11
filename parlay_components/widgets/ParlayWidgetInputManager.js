function ParlayWidgetInputManagerFactory() {

    function ParlayWidgetInputManager() {
        "use strict";
        this.widgets = {};
    }

    ParlayWidgetInputManager.prototype.registerInputs = function (element, scope) {
        "use strict";
        var tag_name = element[0].tagName.toLowerCase().split("-").join("_") + "_" + scope.$index;

        if (!this.widgets[tag_name]) {
            this.widgets[tag_name] = [];
        }

        var card_content = element.find("md-card-content");

        Array.prototype.slice.call(card_content.find("input")).forEach(function (input) {
            this.widgets[tag_name].push({
                type: "input",
                element: input
            });
        }, this);

        scope.$on("$destroy", function () {
            delete this.widgets[tag_name];
        }.bind(this));

        return tag_name;
    };

    ParlayWidgetInputManager.prototype.registerButtons = function (element, scope) {
        "use strict";

        var tag_name = element[0].tagName.toLowerCase().split("-").join("_") + "_" + scope.$index;

        if (!this.widgets[tag_name]) {
            this.widgets[tag_name] = [];
        }

        var card_content = element.find("md-card-content");

        Array.prototype.slice.call(card_content.find("button")).forEach(function (button) {
            this.widgets[tag_name].push({
                type: "button",
                element: button
            });
        }, this);

        scope.$on("$destroy", function () {
            delete this.widgets[tag_name];
        }.bind(this));

        return tag_name;
    };

    function collectWidgets() {
        return Object.keys(this.widgets).reduce(function (previous, current) {
            return previous.concat(this.widgets[current].map(function (item) {
                return {
                    name: current + "_" + item.element.id,
                    type: item.type,
                    element: item.element
                };
            }));
        }.bind(this), []);
    }

    ParlayWidgetInputManager.prototype.getInputs = function () {
        return collectWidgets.call(this).filter(function (item) {
            return item.type == "input";
        });
    };

    ParlayWidgetInputManager.prototype.getButtons = function () {
        return collectWidgets.call(this).filter(function (item) {
            return item.type == "button";
        });
    };

    return new ParlayWidgetInputManager();
}

angular.module("parlay.widgets.inputmanager", [])
    .factory("ParlayWidgetInputManager", ParlayWidgetInputManagerFactory);