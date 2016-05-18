(function () {
    "use strict";

    describe("parlay.widget.collection", function () {

        beforeEach(module("parlay.widget.collection"));

        describe("ParlayWidgetCollection", function () {
            var ParlayWidgetCollection;

            beforeEach(inject(function (_ParlayWidgetCollection_) {
                ParlayWidgetCollection = _ParlayWidgetCollection_;
            }));

            it("initial state", function () {
                expect(ParlayWidgetCollection.getAvailableWidgets()).toEqual([]);
            });

            it("registers a widget", function () {
                ParlayWidgetCollection.registerWidget("testWidget", "test");
                expect(ParlayWidgetCollection.getAvailableWidgets()).toEqual([
                    jasmine.objectContaining({name: "testWidget", type: "test"})
                ]);
            });

            it("registers widgets", function () {
                ParlayWidgetCollection.registerWidgets([
                    {directive_name: "test1", widget_type: "test"},
                    {directive_name: "test2", widget_type: "test"}
                ]);
                expect(ParlayWidgetCollection.getAvailableWidgets()).toEqual([
                    jasmine.objectContaining({name: "test1", type: "test"}),
                    jasmine.objectContaining({name: "test2", type: "test"})
                ]);
            });

        });

    });

}());