(function () {
    "use strict";

    describe("parlay.common.genericsaveloaddialog", function() {
        
        beforeEach(module("parlay.common.genericsaveloaddialog"));
		beforeEach(module("parlay.items.manager"));
        
        describe("ParlayGenericSaveLoadDialogController", function () {
    		var ParlayGenericSaveLoadDialogController, manager;
    
    		beforeEach(inject(function($rootScope, $controller, $q, _ParlayStore_, _ParlayItemManager_) {
	    		manager = _ParlayItemManager_;
    			localStorage.clear();

				var options = {
					entry: "workspace",
					entries: "workspaces",
					title: "workspaces",
					child: "item",
					children: "items"
				};

				ParlayGenericSaveLoadDialogController = $controller("ParlayGenericSaveLoadDialogController", {$scope: $rootScope.$new(), ParlayStore: _ParlayStore_, manager: manager, options: options, $mdDialog: {show: function () {
					return $q(function (resolve) { resolve("test"); });
				}}});
    		}));
    		
    		describe("initial state", function () {

	    		it("getting saved entrys", function () {
					spyOn(manager, "getSaved");
		    		ParlayGenericSaveLoadDialogController.getSaved();
					expect(manager.getSaved).toHaveBeenCalled();
	    		});
	    		
	    		it("does not have items in current entry", function () {
		    		expect(ParlayGenericSaveLoadDialogController.countActive()).toBe(0);
	    		});

				it("gets autosave", function () {
					expect(ParlayGenericSaveLoadDialogController.getAutosave()).toBeUndefined();
				});
	    		
    		});
    		
    		describe("saves, loads and deletes a entry", function () {
	    		
	    		it("saves a entry", function () {
		    		expect(ParlayGenericSaveLoadDialogController.getSaved().length).toBe(0);
		    		ParlayGenericSaveLoadDialogController.saveEntry({name:"test"});
		    		expect(ParlayGenericSaveLoadDialogController.getSaved().length).toBe(1);
	    		});
	    		
	    		it("deletes a entry", function () {
		    		ParlayGenericSaveLoadDialogController.saveEntry({name:"test"});
		    		expect(ParlayGenericSaveLoadDialogController.getSaved().length).toBe(1);
		    		ParlayGenericSaveLoadDialogController.deleteEntry({name:"test"});
		    		expect(ParlayGenericSaveLoadDialogController.getSaved().length).toBe(0);
	    		});
	    		
    		});
    		
    		describe("current entry operations", function () {
	    		
	    		it("clears current entry", function () {
		    		/*jshint newcap: false */
					spyOn(manager, "clearActive");
					ParlayGenericSaveLoadDialogController.clearActive();
					expect(manager.clearActive).toHaveBeenCalled();
	    		});
	    		
    		});
        
    	});
                
    });
    
}());