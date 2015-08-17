(function () {
    'use strict';

    describe('parlay.endpoints.workspaces', function() {
        
        beforeEach(module('parlay.endpoints.workspaces'));
        
        describe('ParlayWorkspaceManagementController', function () {
    		var scope, ParlayWorkspaceManagementController;
    
    		beforeEach(inject(function($rootScope, $controller) {
    			scope = $rootScope.$new();
    			ParlayWorkspaceManagementController = $controller('ParlayWorkspaceManagementController', {$scope: scope});
    		}));   		
        
    	});
                
    });
    
}());