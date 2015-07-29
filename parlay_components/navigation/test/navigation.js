(function () {
    "use strict";
    
    describe('parlay.navigation', function() {
    
        beforeEach(module('parlay.navigation'), module('ngMaterial'));
        
        describe('parlayConnectionStatusController', function () {
        	var scope, parlayConnectionStatusController;
        	
        	beforeEach(inject(function($rootScope, $controller) {
            	scope = $rootScope.$new();            	
            	parlayConnectionStatusController = $controller('ParlayConnectionStatusController', {$scope: scope});
        	}));
        	
        	describe('tests broker interaction', function () {
            	
            	it('initializes', function () {
                	expect(scope.connection_icon).toEqual('cloud_off');
            	});
            	
        	});
        	
    	});
    	
    	describe('ParlayConnectionListController', function () {
        	var scope, ParlayConnectionListController;
        	
        	beforeEach(inject(function ($rootScope, $controller) {
            	scope = $rootScope.$new();
            	ParlayConnectionListController = $controller('ParlayConnectionListController', {$scope: scope});
        	}));
        	
        	describe('protocol manager checks', function () {
            	
            	it('gets open protocols', function () {
                	expect(scope.getOpenProtocols().length).toBe(0);
            	});
            	
            	it('if there are open protocols', function () {
                	expect(scope.hasOpenProtocols()).toBeFalsy();
            	});
            	
        	});
        	
        });
        
    });
}());