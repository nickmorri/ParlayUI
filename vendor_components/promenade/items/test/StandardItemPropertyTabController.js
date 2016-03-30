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
    		
    		
    		
        });
        
	});
	
}());