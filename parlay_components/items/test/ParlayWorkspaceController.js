(function () {
    'use strict';

    describe('parlay.items.workspaces', function() {
        
        beforeEach(module('parlay.items.workspaces'));
        
        describe('ParlayWorkspaceManagementController', function () {
    		var scope, ParlayWorkspaceManagementController, ParlayStore, ParlayItemManager;
    
    		beforeEach(inject(function($rootScope, $controller, $q, _ParlayStore_, _ParlayItemManager_) {
	    		ParlayItemManager = _ParlayItemManager_;
	    		ParlayStore = _ParlayStore_;
    			scope = $rootScope.$new();
    			sessionStorage.clear();
    			localStorage.clear();
    			ParlayWorkspaceManagementController = $controller('ParlayWorkspaceManagementController', {$scope: scope, ParlayStore: ParlayStore, ParlayItemManager: ParlayItemManager, $mdDialog: {show: function () {
			    		return $q(function (resolve) { resolve('test'); });
		    		}}});
    		}));
    		
    		describe('initial state', function () {

	    		it('getting saved workspaces', function () {
		    		expect(ParlayWorkspaceManagementController.getSavedWorkspaces()).toEqual([]);
	    		});
	    		
	    		it('does not have items in current workspace', function () {
		    		expect(ParlayWorkspaceManagementController.currentWorkspaceItemCount()).toBe(0);
	    		});

				it('gets autosave', function () {
					expect(ParlayWorkspaceManagementController.getAutosave()).toBeUndefined();
				});
	    		
    		});
    		
    		describe('saves, loads and deletes a workspace', function () {
	    		
	    		it('saves a workspace', function () {
		    		expect(ParlayWorkspaceManagementController.getSavedWorkspaces().length).toBe(0);
		    		ParlayWorkspaceManagementController.saveWorkspace({name:'test'});
		    		expect(ParlayWorkspaceManagementController.getSavedWorkspaces().length).toBe(1);
	    		});
	    		
	    		it('deletes a workspace', function () {
		    		expect(ParlayWorkspaceManagementController.getSavedWorkspaces().length).toBe(0);
		    		ParlayWorkspaceManagementController.saveWorkspace({name:'test'});
		    		expect(ParlayWorkspaceManagementController.getSavedWorkspaces().length).toBe(1);
		    		ParlayWorkspaceManagementController.deleteWorkspace({name:'test'});
		    		expect(ParlayWorkspaceManagementController.getSavedWorkspaces().length).toBe(0);
	    		});
	    		
    		});
    		
    		describe('current workspace operations', function () {
	    		
	    		it('clears current workspace', function () {
		    		/*jshint newcap: false */
					spyOn(ParlayItemManager, 'clearActiveItems');
					// spyOn(ParlayStore('items'), 'clear');
					ParlayWorkspaceManagementController.clearCurrentWorkspace();
					expect(ParlayItemManager.clearActiveItems).toHaveBeenCalled();
					// expect(ParlayStore('items').clear).toHaveBeenCalled();
	    		});
	    		
    		});
        
    	});
                
    });
    
}());