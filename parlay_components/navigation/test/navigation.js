(function () {
    "use strict";
    
    describe('parlay.navigation', function() {
    
        beforeEach(module('parlay.navigation'), module('ngMaterial'));
        
        describe('parlayConnectionStatusController', function () {
        	var scope, parlayConnectionStatusController, MockBroker;
        	
        	beforeEach(inject(function($rootScope, $controller) {
            	scope = $rootScope.$new();
            	
            	MockBroker = {
                	connected: false,
                	isConnected: function () {
                    	return this.connected;
                	},
                	connect: function () {
                    	this.connected = true;
                	},
                	disconnect: function () {
                    	this.connected = false;
                	}
                	
            	};
            	
            	parlayConnectionStatusController = $controller('ParlayConnectionStatusController', {$scope: scope, PromenadeBroker: MockBroker});
        	}));
        	
        	describe('tests broker interaction', function () {
            	
            	it('initializes', function () {
                	expect(scope.connection_icon).toEqual('cloud_off');
            	});
            	
        	});
        	
    	});
    	
    	describe('ParlayConnectionListController', function () {
        	var scope, ParlayConnectionListController;
        	
        	beforeEach(inject(function ($rootScope, $controller) {
            	scope = $rootScope.$new();
            	ParlayConnectionListController = $controller('ParlayConnectionListController', {$scope: scope});
        	}));
        	
        	describe('protocol manager checks', function () {
            	
            	it('gets open protocols', function () {
                	expect(scope.getOpenProtocols().length).toBe(0);
            	});
            	
            	it('if there are open protocols', function () {
                	expect(scope.hasOpenProtocols()).toBeFalsy();
            	});
            	
        	});
        	
        	xdescribe('protocol manager interactions', function () {
            	
            	it('configures a protocol', function () {});
            	
            	it('closes a protocol', function () {
                	expect(scope.hasOpenProtocols()).toBeTruthy();
                	scope.closeProtocol();
                	expect(scope.hasOpenProtocols()).toBeFalsy();
            	});
            	
        	});
        	
        });
        
    });
}());