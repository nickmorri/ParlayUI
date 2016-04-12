function ParlayWidgetEventHandlerFactory() {

    function ParlayWidgetEventHandler() {
        this.scope = undefined;
        this.functionString = undefined;
    }

    ParlayWidgetEventHandler.prototype.parse = function () {
        return acorn.parse(this.functionString);
    };

    ParlayWidgetEventHandler.prototype.extractEventHandlers = function () {
        return this.parse().body.map(function (ExpressionStatement) {
            return {
                event: ExpressionStatement.expression.arguments[0].value,
                func: ExpressionStatement.expression.arguments[1].body
            };
        });
    };

    return ParlayWidgetEventHandler;
}

angular.module("parlay.widgets.eventhandler", [])
    .factory("ParlayWidgetEventHandler", [ParlayWidgetEventHandlerFactory]);