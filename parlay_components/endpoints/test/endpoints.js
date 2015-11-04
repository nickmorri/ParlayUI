(function () {
    "use strict";

    describe("parlay.endpoints", function() {
        
        beforeEach(module("parlay.endpoints"));
        
    	describe("ParlayEndpointController", function () {
    		var scope, ParlayEndpointController, ParlayEndpointManager;
    		
    		beforeEach(module("mock.parlay.endpoints.manager"));
    
    		beforeEach(inject(function($rootScope, $controller, _ParlayEndpointManager_) {
	    		ParlayEndpointManager = _ParlayEndpointManager_;
    			scope = $rootScope.$new();
    			ParlayEndpointController = $controller("ParlayEndpointController", {$scope: scope});
    		}));
    		
    		describe("accessors", function () {
	    		
	    		it("checks for endpoints", function () {
		    		expect(ParlayEndpointController.hasEndpoints()).toBeFalsy();
	    		});
	    		
    		});
    		
    		describe("workspace management", function() {
	    		
	    		it("reorders endpoints", function () {
		    		spyOn(ParlayEndpointManager, "reorder");
		    		ParlayEndpointController.reorder("1", 1);
		    		expect(ParlayEndpointManager.reorder).toHaveBeenCalledWith(1,1);
	    		});
	    		
	    		it("duplicates endpoints", function () {
		    		spyOn(ParlayEndpointManager, "duplicateEndpoint");
		    		ParlayEndpointController.duplicate(1, 100);
		    		expect(ParlayEndpointManager.duplicateEndpoint).toHaveBeenCalledWith(1, 100);
	    		});
	    		
	    		it("deactivates endpoints", function () {
		    		spyOn(ParlayEndpointManager, "deactivateEndpoint");
		    		ParlayEndpointController.deactivate(1);
		    		expect(ParlayEndpointManager.deactivateEndpoint).toHaveBeenCalledWith(1);
	    		});
	    		
    		});
    		
    		describe("endpoint filtering", function () {
	    		
	    		it("calls ParlayEndpointManager", function () {
                    expect(ParlayEndpointController.filterEndpoints()).toEqual([]);
        		});
        		
    		});
        
    	});
    	
    	describe("ParlayEndpointToolbarController", function() {
	    	var scope, ParlayEndpointToolbarController, ParlayEndpointManager;
    		
    		beforeEach(module("mock.parlay.endpoints.manager"));
    
    		beforeEach(inject(function($rootScope, $controller, _ParlayEndpointManager_) {
	    		ParlayEndpointManager = _ParlayEndpointManager_;
    			scope = $rootScope.$new();
    			ParlayEndpointToolbarController = $controller("ParlayEndpointsToolbarController", {$scope: scope});
    		}));
	    	
	    	
	    	it("requests discovery", function () {
		    	spyOn(ParlayEndpointManager, "requestDiscovery");
		    	ParlayEndpointToolbarController.requestDiscovery();
		    	expect(ParlayEndpointManager.requestDiscovery).toHaveBeenCalled();
	    	});
	    	
    	});
        
    });
    
}());