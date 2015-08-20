(function () {
    'use strict';

    describe('parlay.endpoints.workspaces', function() {
        
        beforeEach(module('parlay.endpoints.workspaces'));
        
        describe('ParlayWorkspaceManagementController', function () {
    		var scope, ParlayWorkspaceManagementController;
    
    		beforeEach(inject(function($rootScope, $controller, $q) {
    			scope = $rootScope.$new();
    			sessionStorage.clear();
    			localStorage.clear();
    			ParlayWorkspaceManagementController = $controller('ParlayWorkspaceManagementController', {$scope: scope, $mdDialog: {show: function () {
			    		return $q(function (resolve, reject) {
				    		resolve('test');
			    		});
		    		}}});
    		}));
    		
    		describe('initial state', function () {

	    		it('getting saved workspaces', function () {
		    		expect(scope.getSavedWorkspaces()).toEqual([]);
	    		});
	    		
	    		it('does not have endpoints in current workspace', function () {
		    		expect(scope.currentWorkspaceEndpointCount()).toBe(0);
	    		});
	    		
    		});
    		
    		describe('saves, loads and deletes a workspace', function () {
	    		
	    		it('saves a workspace', function () {
		    		expect(scope.getSavedWorkspaces().length).toBe(0);
		    		scope.saveWorkspace({name:'test'});
		    		expect(scope.getSavedWorkspaces().length).toBe(1);
	    		});
	    		
	    		it('loads a workspace', function () {
		    		
	    		});
	    		
	    		it('deletes a workspace', function () {
		    		
	    		});
	    		
    		});
    		
    		xdescribe('current workspace operations', function () {
	    		
	    		it('saves current workspace', function () {
		    		expect(scope.getSavedWorkspaces().length).toBe(0);
		    		scope.saveCurrentWorkspace();
		    		expect(scope.getSavedWorkspaces().length).toBe(1);
	    		});
	    		
	    		it('clears current workspace', function () {

	    		});
	    		
    		});
        
    	});
                
    });
    
}());