function PromenadeButtonWidgetRun(ParlayWidgetsCollection) {
    ParlayWidgetsCollection.registerWidget("promenadeButtonWidget", "input");
}

function PromenadeButtonWidget(ParlayWidgetInputManager) {
    return {
        restrict: "E",
        templateUrl: "../vendor_components/promenade/widgets/directives/promenade-button-widget.html",
        link: function (scope, element) {
            var widgetName = "promenadeButtonWidget";
            var parentElement = element.find("md-card-content");
            var targetTag = "button";
            var events = ["click"];

            var registration = ParlayWidgetInputManager.registerElements(widgetName, parentElement, targetTag, scope, events);

            scope.tag_name = registration.parent_tag_name;

            var x = 5;
            var y = 10;

            var code = "alert(x + y);";

            function foobar(text) {
                alert(text.data);
            }

            var initFunc = function (interpreter, scope) {
                interpreter.setProperty(scope, "x", interpreter.createPrimitive(x));
                interpreter.setProperty(scope, "y", interpreter.createPrimitive(y));

                interpreter.setProperty(scope, 'alert', interpreter.createNativeFunction(function(text) {
                    return interpreter.createPrimitive(foobar(text));
                }));
            };

            registration.elements[0].events.click.addListener(function () {
                var interpreter = new Interpreter(code, initFunc);
                interpreter.run();
            });

        }
    };
}

angular.module("promenade.widgets.button", ["parlay.widgets.base", "parlay.widgets.collection"])
    .run(["ParlayWidgetsCollection", PromenadeButtonWidgetRun])
    .directive("promenadeButtonWidget", ["ParlayWidgetInputManager", PromenadeButtonWidget]);