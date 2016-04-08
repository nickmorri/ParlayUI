function ParlayWidgetsCollectionFactory() {
    
    function ParlayWidgetsCollection() {
        this.available_widgets = [];
    }

    ParlayWidgetsCollection.prototype.registerWidget = function (element) {

        var snake_case = element.snakeCase();

        this.available_widgets.push("<" + snake_case + "></" + snake_case + ">");
    };

    ParlayWidgetsCollection.prototype.getAvailableWidgets = function () {
        return this.available_widgets;
    };
    
    return new ParlayWidgetsCollection();    
}

angular.module("parlay.widgets.collection", [])
    .factory("ParlayWidgetsCollection", [ParlayWidgetsCollectionFactory]);