(function () {
    "use strict";
    
    describe('parlay.store', function() {
    
        beforeEach(module('parlay.store'));
        
        describe('ParlayStore', function () {
            var ParlayStore;

            beforeEach(inject(function(_ParlayStore_) {
                /*jshint newcap: false */
                ParlayStore = _ParlayStore_;
            }));
            
            describe('constructs or retrieves', function () {
                
                it('constructs new object for distinct prefix', function () {
	                /*jshint newcap: false */
	                expect(ParlayStore('test1')).not.toBe(ParlayStore('test2'));
                });
                
                it('retrieves the same instance for same prefix', function () {
	                /*jshint newcap: false */
	                expect(ParlayStore('test1')).toBe(ParlayStore('test1'));
                });
                
    		});
    		
    		xit('reacts to onbeforeunload', function () {
	    		expect(localStorage.length).toBe(0);
	    		ParlayStore("endpoints").set("test", "attr", 0);
	    		angular.element(window).triggerHandler("onbeforeunload");
	    		expect(localStorage.length).not.toBe(0);
    		});
    		
        });
        
        describe('ParlayStoreService', function () {
	        var ParlayStoreService;
	        
	        beforeEach(inject(function (_ParlayStoreService_) {
		        // Clear localStorage and sessionStorage in case anything persisted from previous test cases.
		        localStorage.clear();
		        sessionStorage.clear();
		        /*jshint newcap: false */
		        ParlayStoreService = new _ParlayStoreService_('test');
	        }));
	        
	        describe('initially', function () {
		        
		        it('is empty', function () {
			        expect(ParlayStoreService.length()).toBe(0);
			        expect(ParlayStoreService.keys()).toEqual([]);
			        expect(ParlayStoreService.values()).toEqual({});
		        });
		        
	        });
	        
	        describe('accessors', function () {
		        
		        it('sets', function () {
			        expect(ParlayStoreService.length()).toBe(0);
			        ParlayStoreService.set('card', 'speed', 10);
			        expect(ParlayStoreService.length()).toBe(1);
		        });
		        
		        it('gets', function () {
			        expect(ParlayStoreService.length()).toBe(0);
			        ParlayStoreService.set('card', 'speed', 10);
			        expect(ParlayStoreService.length()).toBe(1);
					expect(ParlayStoreService.get('card', 'speed')).toBe(10);
		        });
		        
		        it('removes', function () {
			        expect(ParlayStoreService.length()).toBe(0);
			        ParlayStoreService.set('card', 'speed', 10);
			        expect(ParlayStoreService.length()).toBe(1);
			        ParlayStoreService.remove('card');
			        expect(ParlayStoreService.length()).toBe(0);
		        });
		        
		        it('has', function () {
			        expect(ParlayStoreService.length()).toBe(0);
			        ParlayStoreService.set('card', 'speed', 10);
			        expect(ParlayStoreService.has('card', 'speed')).toBeTruthy();
			        ParlayStoreService.remove('card');
			        expect(ParlayStoreService.has('card', 'speed')).toBeFalsy();
		        });
		        
		        it('clears', function () {
			        expect(ParlayStoreService.length()).toBe(0);
			        ParlayStoreService.set('card1', 'speed', 10);
			        ParlayStoreService.set('card2', 'speed', 10);
			        expect(ParlayStoreService.length()).toBe(2);
			        ParlayStoreService.clear();
			        expect(ParlayStoreService.length()).toBe(0);
		        });
		        
	        });
	        
	        describe('directive container accessors', function () {
		        
		        it('set directive container', function () {
			        expect(ParlayStoreService.length()).toBe(0);
			        ParlayStoreService.setDirectiveContainer('card', {});
			        expect(ParlayStoreService.length()).toBe(1);
		        });
		        
		        it('get directive container', function () {
			        expect(ParlayStoreService.length()).toBe(0);
			        ParlayStoreService.setDirectiveContainer('card', {value: 10});
			        expect(ParlayStoreService.length()).toBe(1);
			        expect(ParlayStoreService.getDirectiveContainer('card').value).toBe(10);
		        });
		        
	        });
	        
	        describe('packing', function () {
		        
		        it('initially empty', function () {
			        expect(ParlayStoreService.packedValues()).toEqual([]);
		        });
		        
		        it('packs value', function () {
			        ParlayStoreService.set('card1', 'speed', 10);
			        expect(ParlayStoreService.packedValues()).toEqual([]);
			        ParlayStoreService.packItem('packed-endpoints', false);
			        expect(ParlayStoreService.packedValues()[0].data['test-card1']).toEqual({speed:10});
		        });
		        
		        it('removes pack value', function () {
			        ParlayStoreService.set('card1', 'speed', 10);
			        expect(ParlayStoreService.packedValues()).toEqual([]);
			        ParlayStoreService.packItem('packed-endpoints', false);
			        expect(ParlayStoreService.packedValues()[0].data['test-card1']).toEqual({speed:10});
			        ParlayStoreService.removePackedItem('packed-endpoints');
			        expect(ParlayStoreService.packedValues()).toEqual([]);
		        });
		        
		        it('unpack value', function () {
			        ParlayStoreService.set('card1', 'speed', 10);
			        expect(ParlayStoreService.packedValues()).toEqual([]);
			        ParlayStoreService.packItem('packed-endpoints', false);
			        
					ParlayStoreService.clear();
					expect(ParlayStoreService.has('card1', 'speed')).toBeFalsy();
					expect(ParlayStoreService.length()).toBe(0);
					
					ParlayStoreService.unpackItem('packed-endpoints');
					expect(ParlayStoreService.get('card1', 'speed')).toBe(10);
		        });
		        
	        });
	        
        });
        
    });
}());