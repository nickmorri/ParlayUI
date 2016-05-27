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
                        toolbar: {
	                        default: [],
	                        available: []
                        },
                        tabs: {
	                        default: [],
	                        available: []
                        }
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

                it("get default directives", function () {
                    expect(ParlayItem.getDefaultDirectives()).toEqual({toolbar:[], tabs:[]});
                });

                it("get available directives", function () {
                    expect(ParlayItem.getAvailableDirectives()).toEqual({toolbar:[], tabs:[]});
                });

            });

            it("matchesQuery logs console message", function () {
                spyOn(console, "warn");
                ParlayItem.matchesQuery("test");
                expect(console.warn).toHaveBeenCalledWith("matchesQuery is not implemented for TestProtocol");
            });

            describe("adds directives", function () {

                it("adds available directives", function () {
                    ParlayItem.addAvailableDirectives("toolbar", ["test1", "test2"]);
                    expect(ParlayItem.getAvailableDirectives()).toEqual({toolbar:["test1", "test2"], tabs:[]});
                });

                it("adds default directives", function () {
                    ParlayItem.addDefaultDirectives("toolbar", ["test1", "test2"]);
                    expect(ParlayItem.getDefaultDirectives()).toEqual({toolbar:["test1", "test2"], tabs:[]});
                });

            });
    		
        });
        
    });
    
}());