(function () {
    "use strict";

    describe('parlay.endpoints', function() {
        
        beforeEach(module('parlay.endpoints'));
        
    	describe('endpointController', function () {
    		var scope, endpointController;
    
    		beforeEach(inject(function($rootScope, $controller) {
    			scope = $rootScope.$new();
    			endpointController = $controller('endpointController', {$scope: scope});
    		}));
    
    		describe('search state', function () {
    
    			it('initilization', function () {
    				expect(scope.isSearching).toBeFalsy();
    			});
    
    			it('toggle', function () {
    				expect(scope.searching).toBeFalsy();
    				scope.toggleSearch();
    				expect(scope.searching).toBeTruthy();
    				scope.toggleSearch();
    				expect(scope.searching).toBeFalsy();
    			});
    
    		});
    
    		describe('display mode', function () {
    
    			it('initilization', function () {
    				expect(scope.displayCards).toBeTruthy();
    			});
    
    		});
    
    		describe('endpoint', function () {
    
    			
    
    		});
    
    	});
        
    });
}());