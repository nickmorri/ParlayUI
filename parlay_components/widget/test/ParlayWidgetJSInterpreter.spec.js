(function () {
    "use strict";

    describe("parlay.widget.interpreter", function () {

        beforeEach(module("parlay.widget.interpreter"));

        describe("ParlayInterpreter", function () {
            var ParlayInterpreter, ParlayData;

            beforeEach(inject(function (_ParlayInterpreter_, _ParlayData_) {
                ParlayInterpreter = new _ParlayInterpreter_();
                ParlayData = _ParlayData_;
            }));

            it("initial values", function () {
                expect(ParlayInterpreter.functionString).toBeUndefined();
                expect(ParlayInterpreter.interpreter).toBeUndefined();
                expect(ParlayInterpreter.constructionError).toBeUndefined();
            });

            describe("construct", function () {

                it("succeeds", function () {

                    var reached = false;

                    function initFunc (interpreter, scope) {
                        reached = true;
                    }

                    ParlayInterpreter.functionString = "10";
                    ParlayInterpreter.construct(initFunc);
                    expect(ParlayInterpreter.interpreter).toBeDefined();
                    expect(ParlayInterpreter.constructionError).toBeUndefined();
                    expect(reached).toBeTruthy();
                });

                it("fails because empty functionString", function () {
                    expect(ParlayInterpreter.constructionError).toBeUndefined();
                    ParlayInterpreter.construct();
                    expect(ParlayInterpreter.interpreter).toBeUndefined();
                    expect(ParlayInterpreter.constructionError).toBe("Editor is empty. Please enter a valid statement.");
                });

                it("fails because invalid functionString", function () {
                    expect(ParlayInterpreter.constructionError).toBeUndefined();
                    ParlayInterpreter.functionString = {};
                    ParlayInterpreter.construct();
                    expect(ParlayInterpreter.interpreter).toBeUndefined();
                    expect(ParlayInterpreter.constructionError).toBe("SyntaxError: Unexpected token (1:8)");
                });

            });

            describe("run", function () {

                it("succeeds", function () {
                    expect(ParlayInterpreter.constructionError).toBeUndefined();
                    ParlayInterpreter.functionString = "10";
                    ParlayInterpreter.construct();
                    expect(ParlayInterpreter.run()).toBe(10);
                    expect(ParlayInterpreter.constructionError).toBeUndefined();
                });

                it("succeeds but with undefined", function () {
                    expect(ParlayInterpreter.constructionError).toBeUndefined();
                    ParlayInterpreter.functionString = "(function () {}())";
                    ParlayInterpreter.construct();
                    expect(ParlayInterpreter.run()).toBe("undefined");
                    expect(ParlayInterpreter.constructionError).toBeUndefined();
                });

                it("fails due as construction hasn't been done", function () {
                    expect(ParlayInterpreter.constructionError).toBeUndefined();
                    ParlayInterpreter.functionString = "(function () {}())";
                    expect(ParlayInterpreter.run()).toBe("ParlayInterpreter.construct() must be done before ParlayInterpreter.run()");
                    expect(ParlayInterpreter.constructionError).toBeUndefined();
                });

                it("fails due to construction error", function () {
                    expect(ParlayInterpreter.constructionError).toBeUndefined();
                    ParlayInterpreter.functionString = {};
                    ParlayInterpreter.construct();
                    expect(ParlayInterpreter.constructionError).toBeDefined();
                    expect(ParlayInterpreter.run()).toBe("SyntaxError: Unexpected token (1:8)");
                });

                it("fails at runtime", function () {
                    expect(ParlayInterpreter.constructionError).toBeUndefined();
                    ParlayInterpreter.functionString = "x";
                    ParlayInterpreter.construct();
                    expect(ParlayInterpreter.run()).toBe("Unhandled exception: Unknown identifier: x");
                });

            });

            it("getItems", function () {
                expect(ParlayInterpreter.getItems()).toEqual([]);
                ParlayData.set("test1", {});
                ParlayData.set("test2", {});
                expect(ParlayInterpreter.getItems()).toEqual([{}, {}]);
            });

            it("makeFunction", function () {

                ParlayInterpreter.functionString = "10";
                ParlayInterpreter.construct();

                expect(ParlayInterpreter.makeFunction(
                    ParlayInterpreter.interpreter, function funcRef() { }, {}
                )).toEqual(jasmine.objectContaining({
                    type: "function",
                    isPrimitive: false
                }));

            });

            it("makeObject", function () {

                ParlayInterpreter.functionString = "10";
                ParlayInterpreter.construct();

                expect(ParlayInterpreter.makeObject(
                    ParlayInterpreter.interpreter, {test: 10, func: function () {}, null_test: null}
                )).toEqual(jasmine.objectContaining({
                    type: "object",
                    isPrimitive: false
                }));

            });

            it("attachFunction", function () {

                ParlayInterpreter.functionString = "built_function(10)";
                ParlayInterpreter.construct();

                ParlayInterpreter.attachFunction(
                    ParlayInterpreter.interpreter.getScope(),
                    ParlayInterpreter.interpreter,
                    function funcRef() { },
                    "built_function"
                );

                expect(ParlayInterpreter.interpreter.getScope().properties.built_function).toEqual(jasmine.objectContaining({
                    isPrimitive: false,
                    type: "function"
                }));

            });

            it("attachObject", function () {

                ParlayInterpreter.functionString = "built_test";
                ParlayInterpreter.construct();

                ParlayInterpreter.attachObject(
                    ParlayInterpreter.interpreter.getScope(),
                    ParlayInterpreter.interpreter,
                    {},
                    "built_test"
                );

                expect(ParlayInterpreter.interpreter.getScope().properties.built_test).toEqual(jasmine.objectContaining({
                    isPrimitive: false,
                    type: "object"
                }));

            });

            it("attachItems", function () {

                var source = [0, 1, 2, 3, 4];

                ParlayInterpreter.functionString = "[" + source.map(function (item, index) {
                        return "built_test" + index;
                    }).join(", ") + "]";

                ParlayInterpreter.construct();

                var target = jasmine.objectContaining({
                    type: "object",
                    isPrimitive: false
                });

                source.forEach(function (item, index) {
                    ParlayInterpreter.attachObject(
                        ParlayInterpreter.interpreter.getScope(),
                        ParlayInterpreter.interpreter,
                        {},
                        "built_test" + index
                    );
                });

                var properties = ParlayInterpreter.interpreter.getScope().properties;

                source.forEach(function (item, index) {
                    expect(properties["built_test" + index]).toEqual(target);
                });

            });

            it("toJSON", function () {

                ParlayInterpreter.functionString = "10";
                ParlayInterpreter.construct();

                expect(ParlayInterpreter.toJSON()).toEqual({functionString: "10"});
                expect(JSON.stringify(ParlayInterpreter)).toEqual('{"functionString":"10"}');

            });

            it("uses attached function", function (done) {

                ParlayInterpreter.functionString = "foo()";
                ParlayInterpreter.construct(function (interpreter, scope) {
                    this.attachFunction(scope, interpreter, function foo() {
                        done();
                    });
                });

                expect(ParlayInterpreter.interpreter.getScope().properties.foo).toEqual(jasmine.objectContaining({
                    isPrimitive: false,
                    type: "function"
                }));

                ParlayInterpreter.run();

            });

            it("uses attached object", function () {
                ParlayInterpreter.functionString = "a.x";
                ParlayInterpreter.construct(function (interpreter, scope) {
                    this.attachObject(scope, interpreter, { x: 10 }, "a");
                });

                expect(ParlayInterpreter.interpreter.getScope().properties.a.properties.x.data).toBe(10);

                expect(ParlayInterpreter.interpreter.getScope().properties.a).toEqual(jasmine.objectContaining({
                    isPrimitive: false,
                    type: "object"
                }));

                expect(ParlayInterpreter.run()).toEqual(10);

            });

        });

    });

}());