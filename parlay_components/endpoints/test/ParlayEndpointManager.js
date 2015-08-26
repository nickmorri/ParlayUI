(function () {
    'use strict';

    describe('parlay.endpoints.manager', function() {
        
        beforeEach(module('parlay.endpoints.manager'));
        beforeEach(module('mock.promenade.broker'));
        beforeEach(module('mock.parlay.protocols.manager'));
        
        describe('ParlayEndpointManager', function () {
            var scope, ParlayEndpointManager, PromenadeBroker;
            
            beforeEach(inject(function (_ParlayEndpointManager_, _PromenadeBroker_) {
                PromenadeBroker = _PromenadeBroker_;
                ParlayEndpointManager = _ParlayEndpointManager_;
            }));
            
            describe('accessors', function () {
                
                it('get active endpoints', function () {
                    expect(ParlayEndpointManager.getActiveEndpoints()).toEqual([]);
                });
                
                it('has active endpoints', function () {
	                expect(ParlayEndpointManager.hasActiveEndpoints()).toBeFalsy();
                });
                
                it('counts active endpoints', function () {
	                expect(ParlayEndpointManager.getActiveEndpointCount()).toBe(0);
                });
            
                it('gets available endpoints', function () {
                    expect(ParlayEndpointManager.getAvailableEndpoints().length).toBe(25);
                });
                    
            });
            
            describe('workspace management', function () {
	            
	            it('activates endpoint', function () {
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeFalsy();
		            ParlayEndpointManager.activateEndpoint({});
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeTruthy();
		            ParlayEndpointManager.activateEndpoint({}, 1000);
		            expect(ParlayEndpointManager.getActiveEndpoints()[1].uid).toBe(1000);
	            });
	            
	            it('deactivates endpoint', function () {
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeFalsy();
		            ParlayEndpointManager.activateEndpoint({});
		            ParlayEndpointManager.activateEndpoint({});
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeTruthy();
		            ParlayEndpointManager.deactivateEndpoint(0);
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeTruthy();
		            ParlayEndpointManager.deactivateEndpoint(0);
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeFalsy();
	            });
	            
	            it('duplicates endpoint', function () {
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeFalsy();
		            ParlayEndpointManager.activateEndpoint({});
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeTruthy();
		            ParlayEndpointManager.duplicateEndpoint(0);
		            expect(ParlayEndpointManager.getActiveEndpointCount()).toBe(2);
	            });
	            
	            it('clears active endpoints', function () {
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeFalsy();
		            ParlayEndpointManager.activateEndpoint({});
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeTruthy();
		            ParlayEndpointManager.clearActiveEndpoints();
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeFalsy();
	            });
	            
	            it('reorders endpoints', function () {
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeFalsy();
		            ParlayEndpointManager.activateEndpoint({});
		            ParlayEndpointManager.activateEndpoint({});
		            expect(ParlayEndpointManager.getActiveEndpointCount()).toBe(2);
		            var initial_endpoint_set_1 = angular.copy(ParlayEndpointManager.getActiveEndpoints());
		            var initial_endpoint_set_2 = angular.copy(ParlayEndpointManager.getActiveEndpoints());
		            expect(angular.equals(initial_endpoint_set_1, initial_endpoint_set_2)).toBeTruthy();
		            ParlayEndpointManager.reorder(0, 1);
		            var post_reorder_endpoint_set = angular.copy(ParlayEndpointManager.getActiveEndpoints());
		            expect(angular.equals(post_reorder_endpoint_set, initial_endpoint_set_2)).toBeFalsy();
		            expect(angular.equals(post_reorder_endpoint_set[1], initial_endpoint_set_1[0])).toBeTruthy();
		            expect(angular.equals(post_reorder_endpoint_set[0], initial_endpoint_set_1[1])).toBeTruthy();
	            });
	            
	            it('loads workspaces', function () {
		            
		            var mockWorkspace = {
			            data: {
				            'test.Endpoint1_1': {$index: 4},
				            'test.Endpoint2_2': {$index: 3},
				            'test.Endpoint3_3': {$index: 2},
				            'test.Endpoint4_4': {$index: 1}
			            }
		            };
		            
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeFalsy();
		            ParlayEndpointManager.loadWorkspace(mockWorkspace);
		            expect(ParlayEndpointManager.getActiveEndpointCount()).toBe(4);
	            });
	            
	            it('fails to load workspace', function () {
		            var mockWorkspace = {
			            data: {
				            'test.Endpoint5_5': {$index: 4},
				            'test.Endpoint6_6': {$index: 3},
				            'test.Endpoint7_7': {$index: 2},
				            'test.Endpoint8_8': {$index: 1}
			            }
		            };
		            
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeFalsy();
		            ParlayEndpointManager.loadWorkspace(mockWorkspace);
		            expect(ParlayEndpointManager.hasActiveEndpoints()).toBeFalsy();
	            });
	            
            });
            
            describe('PromenadeBroker interactions', function () {

                it('requestDiscovery', function () {
                    spyOn(PromenadeBroker, 'requestDiscovery');
                    ParlayEndpointManager.requestDiscovery();
                    expect(PromenadeBroker.requestDiscovery).toHaveBeenCalledWith(true);
                });
                
            });
                        
        });
        
    });
    
}());