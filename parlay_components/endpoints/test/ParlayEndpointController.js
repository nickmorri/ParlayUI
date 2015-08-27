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
    		
    		describe('accessors', function () {
	    		
	    		it('checks for endpoints', function () {
		    		expect(scope.hasEndpoints()).toBeFalsy();
	    		});
	    		
    		});
    		
    		describe('workspace management', function() {
	    		
	    		it('reorders endpoints', function () {
		    		spyOn(ParlayEndpointManager, 'reorder');
		    		scope.reorder('1', 1);
		    		expect(ParlayEndpointManager.reorder).toHaveBeenCalledWith(1,1);
	    		});
	    		
	    		it('duplicates endpoints', function () {
		    		spyOn(ParlayEndpointManager, 'duplicateEndpoint');
		    		scope.duplicate(1, 100);
		    		expect(ParlayEndpointManager.duplicateEndpoint).toHaveBeenCalledWith(1, 100);
	    		});
	    		
	    		it('deactivates endpoints', function () {
		    		spyOn(ParlayEndpointManager, 'deactivateEndpoint');
		    		scope.deactivate(1);
		    		expect(ParlayEndpointManager.deactivateEndpoint).toHaveBeenCalledWith(1);
	    		});
	    		
    		});
    		
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