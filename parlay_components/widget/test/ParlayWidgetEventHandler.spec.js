(function () {
    "use strict";

    describe("parlay.widget.eventhandler", function () {

        beforeEach(module("parlay.widget.eventhandler"));

        describe("ParlayWidgetEventHandler", function () {
            var ParlayInterpreter, ParlayWidgetEventHandler;

            beforeEach(inject(function (_ParlayInterpreter_, _ParlayWidgetEventHandler_) {
                ParlayInterpreter = _ParlayInterpreter_;
                ParlayWidgetEventHandler = _ParlayWidgetEventHandler_;
            }));

            it("initializes", function () {
                spyOn(ParlayInterpreter, "call").and.callThrough();

                var handler = new ParlayWidgetEventHandler();

                expect(ParlayInterpreter.call).toHaveBeenCalled();
            });

            it("construct", function () {
                var event = new Event("test");

                var handler = new ParlayWidgetEventHandler();

                handler.construct(event);
            });

            xit("makeEvent", function () {
                var handler = new ParlayWidgetEventHandler();
                var event = new Event("test");
                handler.construct(event);
                console.log(this.interpreter);
                var interpreter_evt = handler.makeEvent(this.interpreter, event);
            });

            xit("attachEvent", function () {

            });

            it("toJSON", function () {
                expect((new ParlayWidgetEventHandler()).toJSON()).toEqual({functionString: undefined});
            });

        });

    });

}());