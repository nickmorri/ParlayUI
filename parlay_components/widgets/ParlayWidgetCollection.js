(function () {
    "use strict";

    var module_dependencies = [];

    angular
        .module("parlay.widgets.collection", module_dependencies)
        .factory("ParlayWidgetsCollection", ParlayWidgetsCollectionFactory);

    function ParlayWidgetsCollectionFactory() {

        function ParlayWidgetsCollection() {
            this.available_widgets = [];
        }

        ParlayWidgetsCollection.prototype.registerWidget = function (element, type) {

            var snake_case = element.snakeCase();

            this.available_widgets.push({
                name: element,
                template: "<" + snake_case + "></" + snake_case + ">",
                type: type
            });
        };

        ParlayWidgetsCollection.prototype.getAvailableWidgets = function () {
            return this.available_widgets;
        };

        return new ParlayWidgetsCollection();
    }

}());