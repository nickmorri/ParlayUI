(function () {
    'use strict';

    describe('promenade.endpoints.standardendpoint', function() {
    
        beforeEach(module('parlay.endpoints'));

		describe('PromenadeStandardEndpointCardPropertyTabController', function () {
            var scope, rootScope, ctrl, endpoint;
    
            beforeEach(inject(function($rootScope, $controller, $q) {
                rootScope = $rootScope;
    			scope = $rootScope.$new();
    			
    			endpoint = {
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
                
                scope.container = {ref: scope.endpoint, uid: 1000};
                
    			ctrl = $controller('PromenadeStandardEndpointCardPropertyTabController', {$scope: scope}, {endpoint: endpoint});
    		}));
    		
    		it("initializes with default values", function() {
	    		expect(ctrl.waiting).toBeFalsy();
    		});
    		
    		it("gets a property", function() {
	    		spyOn(endpoint, "getProperty").and.callThrough();
	    		ctrl.getProperty({});
	    		expect(ctrl.waiting).toBeTruthy();
	    		expect(endpoint.getProperty).toHaveBeenCalled();
    		});
    		
    		it("sets a property", function() {
	    		spyOn(endpoint, "setProperty").and.callThrough();
	    		ctrl.setProperty({});
	    		expect(ctrl.waiting).toBeTruthy();
	    		expect(endpoint.setProperty).toHaveBeenCalled();
    		});
    		
    		it("gets all properties", function() {
	    		spyOn(endpoint, "getProperty").and.callThrough();
	    		ctrl.getAllProperties();	    		
	    		expect(endpoint.getProperty.calls.count()).toEqual(Object.keys(endpoint.properties).length);
    		});
    		
    		it("sets all properties", function() {
	    		spyOn(endpoint, "setProperty").and.callThrough();	    		
	    		ctrl.setAllProperties();	    		
	    		expect(endpoint.setProperty.calls.count()).toEqual(Object.keys(endpoint.properties).length);
    		});
    		
        });
        
	});
	
}());