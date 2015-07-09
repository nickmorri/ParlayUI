(function () {
    "use strict";
    
    describe('parlay.navigation', function() {
    
        beforeEach(module('parlay.navigation'), module('ngMaterial'));
        
        describe('parlayNavToggleOpen', function () {
            
            it ('defaults open', inject(function ($injector) {
                expect($injector.get('parlayNavToggleOpen')).toBeTruthy();
            }));
        });
        
    	describe('parlayToolbarController', function () {
    		var scope, parlayToolbarController, mediaSize;
    
    		beforeEach(inject(function($rootScope, $controller) {
        		mediaSize = 'md';
    			scope = $rootScope.$new();
    			parlayToolbarController = $controller('parlayToolbarController', {$scope: scope, ParlaySocket: function () {
        			return {
            			close: function () {
                			// Do something
            			},
            			open: function () {
                			// Do something
            			}
        			};
    			}});
    		}));
    		
    		describe('toggle nav menu', function () {
        		it('toggles', inject(function ($mdMedia) {
            		expect(scope.parlayNavToggleOpen).toBe($mdMedia('gt-md'));
            		scope.toggleMenu();
            		expect(scope.parlayNavToggleOpen).toBe(!$mdMedia('gt-md'));
        		}));
    		});
    
    	});
    	
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
    	
    	describe('parlayNavController', function () {
    		var scope, parlayNavController;
    		
    		beforeEach(inject(function($rootScope, $controller) {
    			scope = $rootScope.$new();
    			parlayNavController = $controller('parlayNavController', {$scope: scope, $state: {
            		get: function () {
            		    return [{name: 'editor'}, {name:'settings'}];
        		    }
                }});
    		}));
    		
    		describe('fetches icon for', function () {
        		
        		it('endpoints', function () {
            		expect(scope.fetchIcon('endpoints')).toBe('extension');
        		});
        		
        		it('editor', function () {
            		expect(scope.fetchIcon('editor')).toBe('create');
        		});
        		
        		it('console', function () {
            		expect(scope.fetchIcon('console')).toBe('message');
        		});
        		
        		it('non existant state', function () {
            		expect(scope.fetchIcon('NULL')).toBe('');
        		});
        		
    		});
    		
    		it('builds nav menu from states', function () {
        		expect(scope.states).toEqual([{name:"editor", route:"editor", icon:"create"}]);
    		});
    
    	});
        
    });
}());