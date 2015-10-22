(function () {
    'use strict';

    describe('parlay.utility', function() {
        
        beforeEach(module('parlay.utility'));
        
        describe('ParlayEndpointManager', function () {
            var scope, ParlayUtility;
            
            beforeEach(inject(function (_$rootScope_, _ParlayUtility_) {
                ParlayUtility = _ParlayUtility_;
                scope = _$rootScope_.$new();
            }));
            
            it("converts strings to snake-case", function() {
	            expect(ParlayUtility.snakeCase("helloWorld")).toBe("hello-world");
	            expect(ParlayUtility.snakeCase("parlayProjectArbitraryLengthStringToBeTested")).toBe("parlay-project-arbitrary-length-string-to-be-tested");
            });
            
            describe("locates attributes on scope", function() {});
            
        });
        
    });
}());