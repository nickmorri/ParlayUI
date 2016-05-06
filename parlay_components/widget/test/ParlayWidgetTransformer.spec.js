(function () {
    "use strict";

   describe("parlay.widget.transformer", function () {

       beforeEach(module("parlay.widget.transformer"));
       beforeEach(module("promenade.items.property"));
       beforeEach(module("promenade.items.datastream"));

       describe("ParlayWidgetTransformer", function () {
           var items, ParlayWidgetTransformer, PromenadeStandardProperty, PromenadeStandardDatastream, testProtocol, testInput;

           beforeEach(inject(function (_ParlayWidgetTransformer_, _PromenadeStandardProperty_, _PromenadeStandardDatastream_, _$compile_, _$rootScope_) {

               PromenadeStandardProperty = _PromenadeStandardProperty_;
               PromenadeStandardDatastream = _PromenadeStandardDatastream_;

               testProtocol = {
                   onMessage: function () {},
                   sendMessage: function () {}
               };

               items = [new PromenadeStandardProperty({
                   NAME: "testProp0",
                   INPUT: "number",
                   READ_ONLY: true
               }, "testItem", testProtocol)];

               testInput = _$compile_("<input>")(_$rootScope_.$new())[0];

               ParlayWidgetTransformer = new _ParlayWidgetTransformer_(items);

           }));

           it("initial values", function () {
               expect(ParlayWidgetTransformer.items).toEqual(items);
           });

           it("gets value", function () {
               ParlayWidgetTransformer.functionString = "10";
               expect(ParlayWidgetTransformer.value).toBe(10);
           });

           describe("construct", function () {

               it("succeeds", function () {
                   expect(ParlayWidgetTransformer.constructionError).toBe("Editor is empty. Please enter a valid statement.");
                   ParlayWidgetTransformer.functionString = "10";
                   expect(ParlayWidgetTransformer.constructionError).toBeUndefined();
               });

               it("fails", function () {
                   expect(ParlayWidgetTransformer.constructionError).toBe("Editor is empty. Please enter a valid statement.");
                   ParlayWidgetTransformer.construct();
                   expect(ParlayWidgetTransformer.constructionError).toBe("Editor is empty. Please enter a valid statement.");
               });

           });

           describe("addItem", function () {

               it("PromenadeStandardProperty", function () {
                   ParlayWidgetTransformer.functionString = "10";

                   var new_item = new PromenadeStandardProperty({
                       NAME: "testProp1",
                       INPUT: "number",
                       READ_ONLY: true
                   }, "testItem", testProtocol);

                   ParlayWidgetTransformer.addItem(new_item);
                   expect(ParlayWidgetTransformer.constructionError).toBeUndefined();
                   expect(ParlayWidgetTransformer.items).toEqual(items.concat([new_item]));
               });

               it("PromenadeStandardDatastream", function () {
                   ParlayWidgetTransformer.functionString = "10";

                   var new_item = new PromenadeStandardDatastream({
                       NAME: "testStream1"
                   }, "testItem", testProtocol);

                   ParlayWidgetTransformer.addItem(new_item);
                   expect(ParlayWidgetTransformer.constructionError).toBeUndefined();
                   expect(ParlayWidgetTransformer.items).toEqual(items.concat([new_item]));
               });

           });

           it("removeItem", function () {

               ParlayWidgetTransformer.functionString = "10";

               var new_item = new PromenadeStandardProperty({
                   NAME: "testProp1",
                   INPUT: "number",
                   READ_ONLY: true
               }, "testItem", testProtocol);

               ParlayWidgetTransformer.addItem(new_item);

               expect(ParlayWidgetTransformer.constructionError).toBeUndefined();

               expect(ParlayWidgetTransformer.items).toEqual(items.concat([new_item]));

               ParlayWidgetTransformer.removeItem(new_item);

               expect(ParlayWidgetTransformer.items).toEqual(items);
               expect(ParlayWidgetTransformer.handlers).toEqual([jasmine.any(Function)]);

               expect(ParlayWidgetTransformer.constructionError).toBeUndefined();

           });

           it("cleanHandlers", function () {

               ParlayWidgetTransformer.functionString = "10";
               expect(ParlayWidgetTransformer.constructionError).toBeUndefined();
               expect(ParlayWidgetTransformer.items).toEqual(items);

               ParlayWidgetTransformer.cleanHandlers();

               expect(ParlayWidgetTransformer.items).toEqual([]);
               expect(ParlayWidgetTransformer.handlers).toEqual([]);

           });

           describe("registerHandler", function () {

               it("input", function () {

                   spyOn(testInput, "removeEventListener");

                   var deregistration = ParlayWidgetTransformer.registerHandler({
                       type: "input",
                       element: testInput
                   });

                   expect(deregistration).toEqual(jasmine.any(Function));

                   deregistration();

                   expect(testInput.removeEventListener).toHaveBeenCalled();
               });

               it("other", function () {
                   expect(ParlayWidgetTransformer.registerHandler(new PromenadeStandardProperty({
                       NAME: "testProp1",
                       INPUT: "number",
                       READ_ONLY: true
                   }, "testItem", testProtocol))).toEqual(jasmine.any(Function));
               });

           });

           it("toJSON", function () {
               ParlayWidgetTransformer.functionString = "10";
               expect(ParlayWidgetTransformer.toJSON()).toEqual({functionString: "10"});
               expect(JSON.stringify(ParlayWidgetTransformer)).toEqual('{"functionString":"10"}');
           });

       });

   });

}());