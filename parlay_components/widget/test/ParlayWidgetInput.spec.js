(function () {
    "use strict";

    describe("parlay.widget.input", function () {

        beforeEach(module("parlay.widget.input"));


        describe("<button parlay-widget-input></button>", function () {
            var scope, $compile, ParlayWidgetInputManager;

            beforeEach(angular.mock.inject(function ($injector) {
                scope = $injector.get("$rootScope").$new();
                $compile = $injector.get("$compile");
                ParlayWidgetInputManager = $injector.get("ParlayWidgetInputManager");
            }));

            it("compiles and registers", function () {
                spyOn(ParlayWidgetInputManager, "registerElement");

                scope.template = {
                    name: "testWidget"
                };

                scope.uid = 0;
                scope.events = JSON.stringify(['click']);
                scope.info = {uid:0};
                var element_string = "<button parlay-widget-input widget-name='{{template.name}}' widget-uid='{{uid}}' element-name='test' events='[\"click\"]'></button>";

                var element = $compile(element_string)(scope);
                scope.$digest();


                expect(ParlayWidgetInputManager.registerElement).toHaveBeenCalledWith(jasmine.any(Object), element[0], jasmine.any(Object), ['click']);
            });

        });

    });

}());