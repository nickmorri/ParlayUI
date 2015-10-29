(function () {
    'use strict';

    describe('parlay.endpoints.search', function() {
        
        beforeEach(module('parlay.endpoints.search'));
        beforeEach(module('mock.parlay.endpoints.manager'));
    	
    	describe('ParlayEndpointSearchController', function () {
        	var scope, ParlayEndpointSearchController, ParlayEndpointManager;
        	
        	beforeEach(inject(function ($rootScope, $controller, _ParlayEndpointManager_) {
	        	ParlayEndpointManager = _ParlayEndpointManager_;
            	scope = $rootScope.$new();
            	ParlayEndpointSearchController = $controller('ParlayEndpointSearchController', {$scope: scope});
        	}));
        	
        	describe('search state', function () {
    
    			it('selects endpoint', function () {
        			
        			spyOn(ParlayEndpointManager, 'activateEndpoint');
        			
        			var endpoint = {name: 'test'};
        			
        			scope.search_text = 'still here';
        			
        			scope.selectEndpoint(endpoint);
        			
        			expect(scope.selected_item).toBe(null);
        			expect(scope.search_text).toBe(null);
        			expect(ParlayEndpointManager.activateEndpoint).toHaveBeenCalledWith(endpoint);
        			
    			});
    			
    			it('handles undefined endpoint selection', function () {
        			spyOn(ParlayEndpointManager, 'activateEndpoint');
        			
        			scope.search_text = 'still here';
        			
        			var endpoint = null;
        			
        			scope.selectEndpoint(endpoint);        			

        			expect(scope.search_text).toBe('still here');
    			});
    
    		});
    		
    		describe('searching', function () {
        		  
        		  it('filters correctly', function () {
            		  expect(scope.querySearch('test').length).toBe(2);
        		  });
        		  
        		  it('defaults to no filter if query not provided', function () {
            		  expect(scope.querySearch('').length).toBe(3);
        		  });
        		  
    		});
    		
    	});
        
    });
    
}());