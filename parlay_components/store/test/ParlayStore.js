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
		        // clearSession localStorage and sessionStorage in case anything persisted from previous test cases.
		        localStorage.clear();
		        sessionStorage.clear();
		        /*jshint newcap: false */
		        ParlayStoreService = new _ParlayStoreService_('test');
	        }));
	        
	        describe('initially', function () {
		        
		        it('is empty', function () {
			        expect(ParlayStoreService.getLocalLength()).toBe(0);
			        expect(ParlayStoreService.getSessionLength()).toBe(0);
			        
			        expect(ParlayStoreService.getLocalKeys()).toEqual([]);
			        expect(ParlayStoreService.getSessionKeys()).toEqual([]);
			        
			        expect(ParlayStoreService.getLocalValues()).toEqual({});
			        expect(ParlayStoreService.getSessionValues()).toEqual({});
		        });
		        
	        });
	        
	        describe('sessionStorage accessors', function () {
		        
		        it('sets', function () {
			        expect(ParlayStoreService.getSessionLength()).toBe(0);
			        ParlayStoreService.setSessionItem('card', {speed: 10});
			        expect(ParlayStoreService.getSessionLength()).toBe(1);
		        });
		        
		        it('gets', function () {
			        expect(ParlayStoreService.getSessionLength()).toBe(0);
			        ParlayStoreService.setSessionItem('card', {speed: 10});
			        expect(ParlayStoreService.getSessionLength()).toBe(1);
					expect(ParlayStoreService.getSessionItem('card')).toEqual({speed: 10});
		        });
		        
		        it('removes', function () {
			        expect(ParlayStoreService.getSessionLength()).toBe(0);
			        ParlayStoreService.setSessionItem('card', {speed: 10});
			        expect(ParlayStoreService.getSessionLength()).toBe(1);
			        ParlayStoreService.removeSessionItem('card');
			        expect(ParlayStoreService.getSessionLength()).toBe(0);
		        });
		        
		        it('has', function () {
			        expect(ParlayStoreService.getSessionLength()).toBe(0);
			        ParlayStoreService.setSessionItem('card', {speed: 10});
			        expect(ParlayStoreService.hasSessionItem('card')).toBeTruthy();
			        ParlayStoreService.removeSessionItem('card');
			        expect(ParlayStoreService.hasSessionItem('card')).toBeFalsy();
		        });
		        
		        it('clears', function () {
			        expect(ParlayStoreService.getSessionLength()).toBe(0);
			        ParlayStoreService.setSessionItem('card1', {speed: 10});
			        ParlayStoreService.setSessionItem('card2', {speed: 10});
			        expect(ParlayStoreService.getSessionLength()).toBe(2);
			        ParlayStoreService.clearSession();
			        expect(ParlayStoreService.getSessionLength()).toBe(0);
		        });
		        
	        });
	        
	        describe("localStorage accessors", function () {});
	        
	        describe('packing', function () {
		        
		        it('initially empty', function () {
			        expect(ParlayStoreService.getLocalLength()).toBe(0);
			        expect(ParlayStoreService.getLocalKeys()).toEqual([]);
			        expect(ParlayStoreService.getLocalValues()).toEqual({});
		        });
		        
		        it('packs value', function () {
			        ParlayStoreService.setSessionItem('card', {speed: 10});
			        expect(ParlayStoreService.getLocalValues()).toEqual({});
			        ParlayStoreService.moveItemToLocal("sample", false);
					expect(ParlayStoreService.getLocalValues()["packed-test[sample]"].data["test-card"]).toEqual({speed:10});
		        });
		        
		        it('removes pack value', function () {
			        ParlayStoreService.setSessionItem('card', {speed: 10});
			        expect(ParlayStoreService.getLocalValues()).toEqual({});
			        ParlayStoreService.moveItemToLocal('sample', false);
			        expect(ParlayStoreService.getLocalValues()["packed-test[sample]"].data["test-card"]).toEqual({speed:10});
			        ParlayStoreService.removeLocalItem('sample');
			        expect(ParlayStoreService.getLocalValues()).toEqual({});
		        });
		        
		        it('unpack value', function () {
			        ParlayStoreService.setSessionItem('card1', {speed: 10});
			        expect(ParlayStoreService.getLocalValues()).toEqual({});
			        ParlayStoreService.moveItemToLocal('packed-items', false);
			        
					ParlayStoreService.clearSession();
					expect(ParlayStoreService.hasSessionItem('card1')).toBeFalsy();
					expect(ParlayStoreService.getSessionLength()).toBe(0);
					
					ParlayStoreService.moveItemToSession('packed-items');
					expect(ParlayStoreService.getSessionItem('card1')).toEqual({speed: 10});
		        });
		        
	        });
	        
        });
        
    });
}());