(function () {
    "use strict";

    describe("parlay.items.search", function() {
        
        beforeEach(module("parlay.items.search"));
        beforeEach(module("mock.parlay.items.manager"));
    	
    	describe("ParlayItemSearchController", function () {
        	var scope, ParlayItemSearchController, ParlayItemManager;
        	
        	beforeEach(inject(function ($rootScope, $controller, _ParlayItemManager_) {
	        	ParlayItemManager = _ParlayItemManager_;
            	scope = $rootScope.$new();
            	ParlayItemSearchController = $controller("ParlayItemSearchController", {$scope: scope});
        	}));
        	
        	describe("search state", function () {
    
    			it("selects item", function () {
        			
        			spyOn(ParlayItemManager, "activateItem");
        			
        			var item = {name: "test"};
        			
        			scope.search_text = "still here";
        			
        			ParlayItemSearchController.selectItem(item);
        			
        			expect(scope.selected_item).toBe(null);
        			expect(scope.search_text).toBe(null);
        			expect(ParlayItemManager.activateItem).toHaveBeenCalledWith(item);
        			
    			});
    			
    			it("handles undefined item selection", function () {
        			spyOn(ParlayItemManager, "activateItem");
        			
        			scope.search_text = "still here";
        			
        			var item = null;
        			
        			ParlayItemSearchController.selectItem(item);        			

        			expect(scope.search_text).toBe("still here");
    			});
    
    		});
    		
    		describe("searching", function () {
        		  
        		  it("filters correctly", function () {
            		  expect(ParlayItemSearchController.querySearch("test").length).toBe(2);
        		  });
        		  
        		  it("defaults to no filter if query not provided", function () {
            		  expect(ParlayItemSearchController.querySearch("").length).toBe(3);
        		  });
        		  
    		});
    		
    	});
        
    });
    
}());