(function () {
    'use strict';

    describe('parlay.endpoints.controller', function() {
        
        beforeEach(module('parlay.endpoints.controller'));
        
    	describe('ParlayEndpointController', function () {
    		var scope, ParlayEndpointController, ParlayEndpointManager;
    
    		beforeEach(inject(function($rootScope, $controller) {
        		ParlayEndpointManager = {
        			getActiveEndpoints: function () {
            			return [];
        			},
        			requestDiscovery: function () {}
    			};
    			scope = $rootScope.$new();
    			ParlayEndpointController = $controller('ParlayEndpointController', {$scope: scope, ParlayEndpointManager: ParlayEndpointManager});
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