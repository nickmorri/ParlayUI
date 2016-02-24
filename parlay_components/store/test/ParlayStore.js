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
                
                it('constructs new object for distinct namespace', function () {
	                /*jshint newcap: false */
	                expect(ParlayStore('test1')).not.toBe(ParlayStore('test2'));
                });
                
                it('retrieves the same instance for same namespace', function () {
	                /*jshint newcap: false */
	                expect(ParlayStore('test1')).toBe(ParlayStore('test1'));
                });
                
    		});
    		
        });
        
        describe('ParlayStoreService', function () {
	        var ParlayStoreService;
	        
	        beforeEach(inject(function (_ParlayStoreService_) {
		        // clearSession localStorage in case anything persisted from previous test cases.
		        localStorage.clear();
		        /*jshint newcap: false */
		        ParlayStoreService = new _ParlayStoreService_('test');
	        }));
	        
	        describe('initially', function () {
		        
		        it('is empty', function () {
			        expect(ParlayStoreService.length).toBe(0);
			        expect(ParlayStoreService.keys()).toEqual([]);
			        expect(ParlayStoreService.values()).toEqual({});
		        });
		        
	        });
	        
	        describe("localStorage accessors", function () {

                it('set', function () {
                    expect(ParlayStoreService.length).toBe(0);
                    ParlayStoreService.set('card', {speed: 10});
                    expect(ParlayStoreService.length).toBe(1);
                });

                it('get', function () {
                    expect(ParlayStoreService.length).toBe(0);
                    ParlayStoreService.set('card', {speed: 10});
                    expect(ParlayStoreService.length).toBe(1);
                    expect(ParlayStoreService.get('card')).toEqual({speed: 10});
                });

                it('remove', function () {
                    expect(ParlayStoreService.length).toBe(0);
                    ParlayStoreService.set('card', {speed: 10});
                    expect(ParlayStoreService.length).toBe(1);
                    ParlayStoreService.remove('card');
                    expect(ParlayStoreService.length).toBe(0);
                });

                it('has', function () {
                    expect(ParlayStoreService.length).toBe(0);
                    ParlayStoreService.set('card', {speed: 10});
                    expect(ParlayStoreService.has('card')).toBeTruthy();
                    ParlayStoreService.remove('card');
                    expect(ParlayStoreService.has('card')).toBeFalsy();
                });

                it('clear', function () {
                    expect(ParlayStoreService.length).toBe(0);
                    ParlayStoreService.set('card1', {speed: 10});
                    ParlayStoreService.set('card2', {speed: 10});
                    expect(ParlayStoreService.length).toBe(2);
                    ParlayStoreService.clear();
                    expect(ParlayStoreService.length).toBe(0);
                });

                it('keys', function () {
                    ParlayStoreService.set('card1', {speed: 10});
                    ParlayStoreService.set('card2', {speed: 20});
                    ParlayStoreService.set('card3', {speed: 30});
                    expect(ParlayStoreService.keys()).toEqual(['test[card3]', 'test[card2]', 'test[card1]']);
                });

                it('values', function () {
                    ParlayStoreService.set('card1', {speed: 10});
                    ParlayStoreService.set('card2', {speed: 20});
                    ParlayStoreService.set('card3', {speed: 30});
                    expect(ParlayStoreService.values()).toEqual({
                        'test[card1]': {speed:10},
                        'test[card2]': {speed:20},
                        'test[card3]': {speed:30}
                    });
                });

			});
	        
        });
        
    });
}());