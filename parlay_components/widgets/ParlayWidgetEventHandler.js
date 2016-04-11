function ParlayWidgetEventHandlerFactory() {

    function ParlayWidgetEventHandler() {
        this.scope = undefined;
        this.functionString = undefined;
    }

    return ParlayWidgetEventHandler;
}

angular.module("parlay.widgets.eventhandler", [])
    .factory("ParlayWidgetEventHandler", [ParlayWidgetEventHandlerFactory]);