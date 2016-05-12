(function () {
    "use strict";

    describe("parlay.widget.input", function () {

        beforeEach(module("parlay.widget.input"));

        describe("<button parlay-widget-input></button>", function () {
            var scope, $compile, ParlayWidgetInputManager;

            beforeEach(inject(function (_$rootScope_, _$compile_, _ParlayWidgetInputManager_) {
                scope = _$rootScope_.$new();
                $compile = _$compile_;
                ParlayWidgetInputManager = _ParlayWidgetInputManager_;
            }));

            it("compiles and registers", function () {
                spyOn(ParlayWidgetInputManager, "registerElement");

                scope.template = {
                    name: "testWidget"
                };

                scope.uid = 0;

                scope.events = JSON.stringify(['click']);

                var element_string = "<button parlay-widget-input widget-name='{{template.name}}' widget-uid='{{uid}}' element-name='test' events='{{events}}'></button>";

                var element = $compile(element_string)(scope);
                scope.$digest();

                expect(ParlayWidgetInputManager.registerElement).toHaveBeenCalledWith("testWidget", 0, "test", element[0], jasmine.any(Object), ['click']);
            });

        });

    });

}());