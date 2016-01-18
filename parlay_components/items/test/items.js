(function () {
    "use strict";

    describe("parlay.items", function() {
        
        beforeEach(module("parlay.items"));
        
    	describe("ParlayItemController", function () {
    		var scope, ParlayItemController, ParlayItemManager;
    		
    		beforeEach(module("mock.parlay.items.manager"));
    
    		beforeEach(inject(function($rootScope, $controller, _ParlayItemManager_) {
	    		ParlayItemManager = _ParlayItemManager_;
    			scope = $rootScope.$new();
    			ParlayItemController = $controller("ParlayItemController", {$scope: scope});
    		}));
    		
    		describe("accessors", function () {
	    		
	    		it("checks for items", function () {
		    		expect(ParlayItemController.hasItems()).toBeFalsy();
	    		});
	    		
    		});
    		
    		describe("workspace management", function() {
	    		
	    		it("reorders items", function () {
		    		spyOn(ParlayItemManager, "reorder");
		    		ParlayItemController.reorder("1", 1);
		    		expect(ParlayItemManager.reorder).toHaveBeenCalledWith(1,1);
	    		});
	    		
	    		it("duplicates items", function () {
		    		spyOn(ParlayItemManager, "duplicateItem");
		    		ParlayItemController.duplicate(1, 100);
		    		expect(ParlayItemManager.duplicateItem).toHaveBeenCalledWith(1, 100);
	    		});
	    		
	    		it("deactivates items", function () {
		    		spyOn(ParlayItemManager, "deactivateItem");
		    		ParlayItemController.deactivate(1);
		    		expect(ParlayItemManager.deactivateItem).toHaveBeenCalledWith(1);
	    		});
	    		
    		});
    		
    		describe("item filtering", function () {
	    		
	    		it("calls ParlayItemManager", function () {
                    expect(ParlayItemController.filterItems()).toEqual([]);
        		});
        		
    		});
        
    	});
    	
    	describe("ParlayItemToolbarController", function() {
	    	var scope, ParlayItemToolbarController, ParlayItemManager;
    		
    		beforeEach(module("mock.parlay.items.manager"));
    
    		beforeEach(inject(function($rootScope, $controller, _ParlayItemManager_) {
	    		ParlayItemManager = _ParlayItemManager_;
    			scope = $rootScope.$new();
    			ParlayItemToolbarController = $controller("ParlayItemsToolbarController", {$scope: scope});
    		}));
	    	
	    	
	    	it("requests discovery", function () {
		    	spyOn(ParlayItemManager, "requestDiscovery");
		    	ParlayItemToolbarController.requestDiscovery();
		    	expect(ParlayItemManager.requestDiscovery).toHaveBeenCalled();
	    	});
	    	
    	});
        
    });
    
}());