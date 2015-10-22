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
	        
	        it("converts strings to snake-case", function() {
	            expect(ParlayUtility.snakeCase("helloWorld")).toBe("hello-world");
	            expect(ParlayUtility.snakeCase("parlayProjectArbitraryLengthStringToBeTested")).toBe("parlay-project-arbitrary-length-string-to-be-tested");
	        });
	        
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
        
    });
    
}());