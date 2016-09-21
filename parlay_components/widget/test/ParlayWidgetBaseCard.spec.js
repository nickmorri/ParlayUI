(function () {
    "use strict";

    xdescribe("parlay.widget.base.card", function () {

        beforeEach(module("parlay.widget.base.card"));

        describe("<parlay-widget-base-card>", function () {
            var scope, $rootScope, $compile;

            beforeEach(inject(function (_$rootScope_, _$compile_) {
                $rootScope = _$rootScope_;
                scope = _$rootScope_.$new();
                $compile = _$compile_;
            }));

            it("compiles", function (done) {

                var element;

                $rootScope.$on("parlayWidgetBaseCardLoaded", function (event, emitted_element) {
                    expect(emitted_element).toBe(element);
                    done();
                });

                var element_string = "" +
                "<parlay-widget-base-card>" +
                    "<parlay-widget-base-card-title>" +
                        "<span>hey</span>" +
                    "</parlay-widget-base-card-title>" +
                    "<parlay-widget-base-card-content>" +
                        "<span>you</span>" +
                    "</parlay-widget-base-card-content>" +
                "</parlay-widget-base-card>";

                element = $compile(element_string)(scope);

                scope.$digest();
            });

        });

    });

}());