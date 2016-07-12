(function () {
    'use strict';

    describe('parlay.items.item', function() {
        
        beforeEach(module('parlay.items.item'));
        
        describe('ParlayItem', function () {
            var ParlayItem;
            
            var data = {
        		NAME: 'TestProtocol',
        		INTERFACES: []
    		};
    		
    		var protocol = {
        		activateItem: function (item) {}
    		};

            beforeEach(inject(function(_ParlayItem_) {
                /*jshint newcap: false */
                ParlayItem = new _ParlayItem_(data, protocol);
            }));
            
            describe('construction', function () {
                
                it('has correct default values', function () {
                    expect(ParlayItem.directives).toEqual({
                        toolbar: [],
                        tabs: []
                    });
                    expect(ParlayItem.type).toBe('ParlayItem');
                    
                });
                
                it('has correct constructor parameters', function () {
                    expect(ParlayItem.name).toBe(data.NAME);
                    expect(ParlayItem.interfaces).toEqual(data.INTERFACES);
                    expect(ParlayItem.protocol).toEqual(protocol);
                });
                
    		});

			describe("accessors", function () {

                it("type", function () {
                    expect(ParlayItem.getType()).toBe("ParlayItem");
                });

                it("get directives", function () {
                    expect(ParlayItem.getDirectives()).toEqual({toolbar:[], tabs:[]});
                });

            });

            it("matchesQuery logs console message", function () {
                spyOn(console, "warn");
                ParlayItem.matchesQuery("test");
                expect(console.warn).toHaveBeenCalledWith("matchesQuery is not implemented for TestProtocol");
            });

            it("adds directives", function () {

                ParlayItem.addDirectives("toolbar", ["test1", "test2"]);
                expect(ParlayItem.getDirectives()).toEqual({toolbar:["test1", "test2"], tabs:[]});

            });
    		
        });
        
    });
    
}());