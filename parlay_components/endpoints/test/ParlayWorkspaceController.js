(function () {
    'use strict';

    describe('parlay.endpoints.workspaces', function() {
        
        beforeEach(module('parlay.endpoints.workspaces'));
        
        describe('ParlayWorkspaceManagementController', function () {
    		var scope, ParlayWorkspaceManagementController, ParlayStore, ParlayEndpointManager;
    
    		beforeEach(inject(function($rootScope, $controller, $q, _ParlayStore_, _ParlayEndpointManager_) {
	    		ParlayEndpointManager = _ParlayEndpointManager_;
	    		ParlayStore = _ParlayStore_;
    			scope = $rootScope.$new();
    			sessionStorage.clear();
    			localStorage.clear();
    			ParlayWorkspaceManagementController = $controller('ParlayWorkspaceManagementController', {$scope: scope, ParlayStore: ParlayStore, ParlayEndpointManager: ParlayEndpointManager, $mdDialog: {show: function () {
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
	    		
	    		xit('loads a workspace', function () {
		    		scope.saveWorkspace({name:'test'});
		    		scope.loadWorkspace({name:'test'});
	    		});
	    		
	    		it('deletes a workspace', function () {
		    		expect(scope.getSavedWorkspaces().length).toBe(0);
		    		scope.saveWorkspace({name:'test'});
		    		expect(scope.getSavedWorkspaces().length).toBe(1);
		    		scope.deleteWorkspace({name:'test'});
		    		expect(scope.getSavedWorkspaces().length).toBe(0);
	    		});
	    		
    		});
    		
    		describe('current workspace operations', function () {
	    		
	    		it('clears current workspace', function () {
		    		/*jshint newcap: false */
					spyOn(ParlayEndpointManager, 'clearActiveEndpoints');
					// spyOn(ParlayStore('endpoints'), 'clear');
					scope.clearCurrentWorkspace();
					expect(ParlayEndpointManager.clearActiveEndpoints).toHaveBeenCalled();
					// expect(ParlayStore('endpoints').clear).toHaveBeenCalled();
	    		});
	    		
    		});
        
    	});
                
    });
    
}());