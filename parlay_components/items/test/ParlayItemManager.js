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
            
            describe('accessors', function () {
                
                it('get active items', function () {
                    expect(ParlayItemManager.getActiveItems()).toEqual([]);
                });
                
                it('has active items', function () {
	                expect(ParlayItemManager.hasActiveItems()).toBeFalsy();
                });
                
                it('counts active items', function () {
	                expect(ParlayItemManager.getActiveItemCount()).toBe(0);
                });
            
                it('gets available items', function () {
                    expect(ParlayItemManager.getAvailableItems().length).toBe(25);
                });
                    
            });
            
            describe('workspace management', function () {
	            
	            it('activates item', function () {
		            expect(ParlayItemManager.hasActiveItems()).toBeFalsy();
		            ParlayItemManager.activateItem({});
		            expect(ParlayItemManager.hasActiveItems()).toBeTruthy();
		            ParlayItemManager.activateItem({}, 1000);
		            expect(ParlayItemManager.getActiveItems()[1].uid).toBe(1000);
	            });
	            
	            it('deactivates item', function () {
		            expect(ParlayItemManager.hasActiveItems()).toBeFalsy();
		            ParlayItemManager.activateItem({});
		            ParlayItemManager.activateItem({});
		            expect(ParlayItemManager.hasActiveItems()).toBeTruthy();
		            ParlayItemManager.deactivateItem(0);
		            expect(ParlayItemManager.hasActiveItems()).toBeTruthy();
		            ParlayItemManager.deactivateItem(0);
		            expect(ParlayItemManager.hasActiveItems()).toBeFalsy();
	            });
	            
	            it('duplicates item', function () {
		            expect(ParlayItemManager.hasActiveItems()).toBeFalsy();
		            ParlayItemManager.activateItem({name: 'test'});
		            expect(ParlayItemManager.hasActiveItems()).toBeTruthy();
		            ParlayItemManager.duplicateItem(0);
		            expect(ParlayItemManager.getActiveItemCount()).toBe(2);
	            });
	            
	            it('clears active items', function () {
		            expect(ParlayItemManager.hasActiveItems()).toBeFalsy();
		            ParlayItemManager.activateItem({});
		            expect(ParlayItemManager.hasActiveItems()).toBeTruthy();
		            ParlayItemManager.clearActiveItems();
		            expect(ParlayItemManager.hasActiveItems()).toBeFalsy();
	            });
	            
	            it('reorders items', function () {
		            expect(ParlayItemManager.hasActiveItems()).toBeFalsy();
		            ParlayItemManager.activateItem({});
		            ParlayItemManager.activateItem({});
		            expect(ParlayItemManager.getActiveItemCount()).toBe(2);
		            
		            var initial_item_set_1 = angular.copy(ParlayItemManager.getActiveItems());
		            var initial_item_set_2 = angular.copy(ParlayItemManager.getActiveItems());
		            expect(angular.equals(initial_item_set_1, initial_item_set_2)).toBeTruthy();
		            
		            ParlayItemManager.reorder(0, 1);
		            var post_reorder_item_set = angular.copy(ParlayItemManager.getActiveItems());
		            expect(angular.equals(post_reorder_item_set, initial_item_set_2)).toBeFalsy();
		            expect(angular.equals(post_reorder_item_set[1], initial_item_set_1[0])).toBeTruthy();
		            expect(angular.equals(post_reorder_item_set[0], initial_item_set_1[1])).toBeTruthy();
	            });
	            
	            it('loads workspaces', function () {
		            
		            var mockWorkspace = {
			            data: {
				            'test.Item1_1': {$index: 4},
				            'test.Item2_2': {$index: 3},
				            'test.Item3_3': {$index: 2},
				            'test.Item4_4': {$index: 1}
			            }
		            };
		            
		            expect(ParlayItemManager.hasActiveItems()).toBeFalsy();
		            var result = ParlayItemManager.loadWorkspace(mockWorkspace);
					expect(result.loaded_items.length).toBe(4);
		            expect(ParlayItemManager.getActiveItemCount()).toBe(4);
	            });
	            
	            it('fails to load workspace', function () {
		            var mockWorkspace = {
			            data: {
				            'test.Item5_5': {$index: 4},
				            'test.Item6_6': {$index: 3},
				            'test.Item7_7': {$index: 2},
				            'test.Item8_8': {$index: 1}
			            }
		            };
		            
		            expect(ParlayItemManager.hasActiveItems()).toBeFalsy();
		            var result = ParlayItemManager.loadWorkspace(mockWorkspace);
					expect(result.failed_items.length).toBe(4);
		            expect(ParlayItemManager.hasActiveItems()).toBeFalsy();
	            });

                it("partially fails to load workspace", function () {

                    var mockWorkspace = {
                        data: {
                            'test.Item1_1': {$index: 4},
                            'test.Item2_2': {$index: 3},
                            'test.Item3_3': {$index: 2},
                            'test.Item4_4': {$index: 1},
                            'test.Item5_5': {$index: 4},
                            'test.Item6_6': {$index: 3},
                            'test.Item7_7': {$index: 2},
                            'test.Item8_8': {$index: 1}
                        }
                    };

                    expect(ParlayItemManager.hasActiveItems()).toBeFalsy();
                    var result = ParlayItemManager.loadWorkspace(mockWorkspace);
                    expect(result.failed_items.length).toBe(4);
                    expect(result.loaded_items.length).toBe(4);
                    expect(ParlayItemManager.hasActiveItems()).toBeTruthy();
                    expect(ParlayItemManager.getActiveItemCount()).toBe(4);

                });
	            
	            it("AutoSaves stores values", function () {
		    		expect(localStorage.length).toBe(0);
		    		ParlayItemManager.activateItem({}, 100);
		    		/*jshint newcap: false */
		    		ParlayItemManager.autoSave();
		    		expect(localStorage.length).toBe(1);
	            });
	            
            });
            
            describe('PromenadeBroker interactions', function () {

				it("has discovered", function (done) {
					expect(ParlayItemManager.hasDiscovered()).toBe(PromenadeBroker.getLastDiscovery() !== undefined);
					PromenadeBroker.requestDiscovery(true).then(function () {
						expect(ParlayItemManager.hasDiscovered()).toBe(PromenadeBroker.getLastDiscovery() !== undefined);
						done();
					});
					$rootScope.$digest();
				});

                it('requestDiscovery', function (done) {
                    PromenadeBroker.requestDiscovery(true).then(done);
                    $rootScope.$digest();
                });
                
            });
                        
        });
        
    });
    
}());