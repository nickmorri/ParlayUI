(function () {
    'use strict';

    describe('promenade.items.standarditem', function() {
    
        beforeEach(module('parlay.items'));

		describe('PromenadeStandardItemCardPropertyTabController', function () {
            var scope, rootScope, ctrl, item;
    
            beforeEach(inject(function($rootScope, $controller, $q) {
                rootScope = $rootScope;
    			scope = $rootScope.$new();
    			
    			item = {
	    			getProperty: function (property) {
		    			return $q(function (resolve) {
							resolve();
		    			});
	    			},
	    			setProperty: function (property) {
		    			return $q(function (resolve) {
							resolve();
		    			});
	    			},
                    properties: {
	                    "property1": {},
	                    "property2": {}
                    }
                };
                
                scope.container = {ref: scope.item, uid: 1000};
                
    			ctrl = $controller('PromenadeStandardItemCardPropertyTabController', {$scope: scope}, {item: item});
    		}));
    		
    		it("initializes with default values", function() {
	    		expect(ctrl.waiting).toBeFalsy();
    		});
    		
    		it("gets a property", function() {
	    		spyOn(item, "getProperty").and.callThrough();
	    		ctrl.getProperty({});
	    		expect(ctrl.waiting).toBeTruthy();
	    		expect(item.getProperty).toHaveBeenCalled();
    		});
    		
    		it("sets a property", function() {
	    		spyOn(item, "setProperty").and.callThrough();
	    		ctrl.setProperty({});
	    		expect(ctrl.waiting).toBeTruthy();
	    		expect(item.setProperty).toHaveBeenCalled();
    		});
    		
    		it("gets all properties", function() {
	    		spyOn(item, "getProperty").and.callThrough();
	    		ctrl.getAllProperties();	    		
	    		expect(item.getProperty.calls.count()).toEqual(Object.keys(item.properties).length);
    		});
    		
    		it("sets all properties", function() {
	    		spyOn(item, "setProperty").and.callThrough();	    		
	    		ctrl.setAllProperties();	    		
	    		expect(item.setProperty.calls.count()).toEqual(Object.keys(item.properties).length);
    		});
    		
        });
        
	});
	
}());