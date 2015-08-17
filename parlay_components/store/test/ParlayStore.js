(function () {
    "use strict";
    
    describe('parlay.store', function() {
    
        beforeEach(module('parlay.store'));
        
        describe('ParlayStore', function () {
            var ParlayStore;

            beforeEach(inject(function(_ParlayStore) {
                /*jshint newcap: false */
                ParlayStore = new _ParlayStore_();
            }));
            
            xdescribe('construction', function () {
                
                it('has correct default values', function () {
                    expect(ParlayEndpoint.directives).toEqual({
                        toolbar: [],
                        tabs: []
                    });
                    expect(ParlayEndpoint.type).toBe('ParlayEndpoint');
                    
                });
                
                it('has correct constructor parameters', function () {
                    expect(ParlayEndpoint.name).toBe(data.NAME);
                    expect(ParlayEndpoint.interfaces).toEqual(data.INTERFACES);
                    expect(ParlayEndpoint.protocol).toEqual(protocol);
                });
                
    		});
    		
        });
        
    });
}());