(function () {
    "use strict";

    describe("parlay.widget.eventhandler", function () {

        beforeEach(module("parlay.widget.eventhandler"));
        beforeEach(module("parlay.widget.inputmanager"));

        describe("ParlayWidgetEventHandler", function () {
            var scope, ParlayInterpreter, ParlayWidgetInputManager, ParlayWidgetEventHandler;

            beforeEach(inject(function (_$rootScope_, _ParlayInterpreter_, _ParlayWidgetInputManager_, _ParlayWidgetEventHandler_) {
                scope = _$rootScope_.$new();
                ParlayInterpreter = _ParlayInterpreter_;
                ParlayWidgetInputManager = _ParlayWidgetInputManager_;
                ParlayWidgetEventHandler = _ParlayWidgetEventHandler_;
            }));

            it("initializes", function () {
                spyOn(ParlayInterpreter, "call").and.callThrough();
                var handler = new ParlayWidgetEventHandler();
                expect(ParlayInterpreter.call).toHaveBeenCalled();
            });

            it("construct", function () {
                (new ParlayWidgetEventHandler()).construct(new Event("test"));
            });

            it("attach", function () {
                var element = document.createElement("button");
                ParlayWidgetInputManager.registerElement("testWidget", 0, "testButton", element, scope, ['click']);
                var event = ParlayWidgetInputManager.getEvents()[0];
                var handler = new ParlayWidgetEventHandler();
                handler.attach(event);
                expect(event.handler).toBe(handler);
            });

            it("detach", function () {
                var element = document.createElement("button");
                ParlayWidgetInputManager.registerElement("testWidget", 0, "testButton", element, scope, ['click']);
                var event = ParlayWidgetInputManager.getEvents()[0];

                var handler = new ParlayWidgetEventHandler();
                handler.attach(event);
                expect(event.handler).toBe(handler);
                handler.detach();
                expect(event.handler).toBe(null);
            });

            it("attachEvent", function () {
                spyOn(window.console, "log");
                var element = document.createElement("input");
                ParlayWidgetInputManager.registerElement("testWidget", 0, "testInput", element, scope, ['click']);
                var event = ParlayWidgetInputManager.getEvents()[0];

                var handler = new ParlayWidgetEventHandler();
                handler.functionString = "log('test')";
                handler.attach(event);

                element.dispatchEvent(new Event('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                }));
                expect(window.console.log).toHaveBeenCalledWith('test');
            });

            it("toJSON", function () {
                expect((new ParlayWidgetEventHandler()).toJSON()).toEqual({functionString: undefined});
            });

        });

    });

}());