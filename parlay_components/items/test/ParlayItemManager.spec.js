(function () {
    'use strict';

    describe('parlay.items.manager', function() {
        
        beforeEach(module('parlay.items.manager'));
        beforeEach(module('mock.promenade.broker'));
        beforeEach(module('mock.parlay.protocols.manager'));
        
        describe('ParlayItemManager', function () {
            var ParlayItemManager, PromenadeBroker, $rootScope;
            
            beforeEach(inject(function (_ParlayItemManager_, _PromenadeBroker_, _$rootScope_) {
                PromenadeBroker = _PromenadeBroker_;
                ParlayItemManager = _ParlayItemManager_;
                $rootScope = _$rootScope_;
            }));
            
            beforeEach(function () {
	            // Clear localStorage and sessionStorage in case anything persisted from previous test cases.
		        localStorage.clear();
		        sessionStorage.clear();
            });

            describe('PromenadeBroker interactions', function () {

                // it("has discovered", function (done) {
					// expect(ParlayItemManager.hasDiscovered()).toBe(PromenadeBroker.getLastDiscovery() !== undefined);
					// PromenadeBroker.requestDiscovery(true).then(function () {
					// 	expect(ParlayItemManager.hasDiscovered()).toBe(PromenadeBroker.getLastDiscovery() !== undefined);
					// 	done();
					// });
					// $rootScope.$digest();
                // });
                //
                // it('requestDiscovery', function (done) {
                //     PromenadeBroker.requestDiscovery(true).then(done);
                //     $rootScope.$digest();
                // });
                
            });
                        
        });
        
    });
    
}());