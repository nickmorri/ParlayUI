(function () {
    "use strict";

    describe("parlay.utility", function() {
        var scope, ParlayUtility;
        
        beforeEach(module("parlay.utility"));
            
        beforeEach(inject(function (_$rootScope_, _ParlayUtility_) {
            ParlayUtility = _ParlayUtility_;
            scope = _$rootScope_.$new();
        }));
        
        describe("ParlayUtility", function () {

	        it("locates attributes on scope", function() {
		        scope.test = true;		        
		        var sub_scope = scope.$new();		        
		        sub_scope.hey = false;
		        
		        expect(ParlayUtility.relevantScope(scope, "test")).toBeDefined();
		        expect(ParlayUtility.relevantScope(sub_scope, "test")).toBeDefined();
		        expect(ParlayUtility.relevantScope(sub_scope, "hey")).toBeDefined();
		        
		        expect(ParlayUtility.relevantScope(scope, "hey")).toBeUndefined();
		        expect(ParlayUtility.relevantScope(sub_scope, "woah")).toBeUndefined();
		        expect(ParlayUtility.relevantScope(scope, "woah")).toBeUndefined();
	        });
	        
        });

        xdescribe("powerset", function() {

            function setEquality(first) {

            }

            it ("equals", function () {
                var input = new Set([0, 1, 2]);

                var expected = new Set([
                    new Set(),
                    new Set([0]), new Set([1]), new Set([2]),
                    new Set([0, 1]), new Set([0, 2]), new Set([1, 2]),
                    new Set([0, 1, 2])
                ]);

                expect(input.powerset().equals(expected)).toBeTruthy();
            });

		});

        xdescribe("combinations of", function () {});

        describe("snake case", function () {

            it("outputs correctly", function() {
                expect("parlayTestDirective".snakeCase()).toBe("parlay-test-directive");
                expect("ParlayTestDirective".snakeCase()).toBe("parlay-test-directive");
                expect("PTabs".snakeCase()).toBe("p-tabs");
                expect("parlayProjectArbitraryLengthStringToBeTested".snakeCase()).toBe("parlay-project-arbitrary-length-string-to-be-tested");
            });

        });

		describe('stable encode', function () {

			// NOTE: Encoding is done by sorting topics by comparison of keys in Unicode code point order.

			it('strings', function () {
				expect({"type": "motor"}.stableEncode()).toBe('{"type":"motor"}');
			});

			it('numbers', function () {
				expect({"to_device": 22}.stableEncode()).toBe('{"to_device":22}');
			});

			it('arrays', function () {
				expect({"params": []}.stableEncode()).toBe('{"params":[]}');
				expect({"params": [5, 10]}.stableEncode()).toBe('{"params":[10,5]}');
				expect({"params": [{"type":1}, 10]}.stableEncode()).toBe('{"params":[10,{"type":1}]}');
			});

			it('multiple topics', function () {
				expect({"type": "motor", "weight":"bold"}.stableEncode()).toBe('{"type":"motor","weight":"bold"}');
			});

			it('mixed types', function () {
				expect({"to_device": 22}.stableEncode()).toBe('{"to_device":22}');
			});

			it('nested', function () {
				expect({"params": {"port": 22, "socket":"localhost"}, "data": []}.stableEncode()).toBe('{"data":[],"params":{"port":22,"socket":"localhost"}}');
			});

			it('orders topics consistently', function () {
				expect({"aaa":0, "bbb":1}.stableEncode()).toBe('{"aaa":0,"bbb":1}');
				expect({"bbb":1, "aaa":0}.stableEncode()).toBe('{"aaa":0,"bbb":1}');
			});

			it('other type', function () {
				expect((Boolean(true).stableEncode())).toBe('true');
			});

		});

	});
    
}());