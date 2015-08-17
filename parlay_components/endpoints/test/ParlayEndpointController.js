(function () {
    'use strict';

    describe('parlay.endpoints.controller', function() {
        
        beforeEach(module('parlay.endpoints.controller'));
        beforeEach(module('mock.parlay.endpoints.manager'));
        
    	describe('ParlayEndpointController', function () {
    		var scope, ParlayEndpointController, ParlayEndpointManager;
    
    		beforeEach(inject(function($rootScope, $controller, _ParlayEndpointManager_) {
	    		ParlayEndpointManager = _ParlayEndpointManager_;
    			scope = $rootScope.$new();
    			ParlayEndpointController = $controller('ParlayEndpointController', {$scope: scope});
    		}));
    		
    		describe('endpoint filtering', function () {
        		it('calls ParlayEndpointManager', function () {
                    expect(scope.filterEndpoints()).toEqual([]);
        		});
    		});
    		
    		describe('discovery request', function () {
        		it('calls ParlayEndpointManager', function () {
            		spyOn(ParlayEndpointManager, 'requestDiscovery');
            		scope.requestDiscovery();
            		expect(ParlayEndpointManager.requestDiscovery).toHaveBeenCalled();
        		});
    		});    		
        
    	});
        
    });
    
}());