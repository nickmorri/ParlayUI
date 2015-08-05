(function () {
    'use strict';

    describe('parlay.endpoints', function() {
        
        beforeEach(module('parlay.endpoints'));
        
        describe('ParlayEndpoint', function () {
            var ParlayEndpoint;
            
            var data = {
        		NAME: 'TestProtocol',
        		INTERFACES: []
    		};
    		
    		var protocol = {
        		activateEndpoint: function (endpoint) {}
    		};

            beforeEach(inject(function(_ParlayEndpoint_) {
                /*jshint newcap: false */
                ParlayEndpoint = new _ParlayEndpoint_(data, protocol);
            }));
            
            describe('construction', function () {
                
                it('has correct default values', function () {
                    expect(ParlayEndpoint.directives).toEqual({
                        toolbar: [],
                        tabs: []
                    });
                    expect(ParlayEndpoint.type).toBe('ParlayEndpoint');
                    
                });
                
                it('has correct constructor parameters', function () {
                    expect(ParlayEndpoint.name).toBe(data.NAME);
                    expect(ParlayEndpoint.interfaces).toEqual(data.INTERFACES);
                    expect(ParlayEndpoint.protocol).toEqual(protocol);
                });
                
    		});
    		
        });
        
        describe('ParlayEndpointManager', function () {
            var scope, ParlayEndpointManager, PromenadeBroker;
            
            beforeEach(function () {
                function PromenadeBroker() {
                    return {
                        requestDiscovery: function () {}
                    };                    
                }
                
                function ProtocolManager() {
                    return {
                        getOpenProtocols: function () {
                            return [
                                {
                                    getActiveEndpoints: function () {
                                        return [1];
                                    },
                                    getAvailableEndpoints: function () {
                                        return [3];
                                    }
                                },
                                {
                                    getActiveEndpoints: function () {
                                        return [2];
                                    },
                                    getAvailableEndpoints: function () {
                                        return [4];
                                    }
                                }
                            ];
                        }
                    };
                }
                
                module(function ($provide) {
                    $provide.service('PromenadeBroker', PromenadeBroker);
                    $provide.service('ProtocolManager', ProtocolManager);
                });
                
            });
            
            beforeEach(inject(function (_ParlayEndpointManager_, _PromenadeBroker_) {
                PromenadeBroker = _PromenadeBroker_;
                ParlayEndpointManager = _ParlayEndpointManager_;
            }));
            
            describe('accessors', function () {
                
                xit('getActiveEndpoints', function () {
                    expect(ParlayEndpointManager.getActiveEndpoints()).toEqual([1,2]);
                });
            
                it('getAvailableEndpoints', function () {
                    expect(ParlayEndpointManager.getAvailableEndpoints()).toEqual([3,4]);
                });
                    
            });
            
            describe('PromenadeBroker interactions', function () {

                it('requestDiscovery', function () {
                    spyOn(PromenadeBroker, 'requestDiscovery');
                    ParlayEndpointManager.requestDiscovery();
                    expect(PromenadeBroker.requestDiscovery).toHaveBeenCalledWith(true);
                });
                
            });
            
            describe('ProtocolManager interactions', function () {
                
               xit('activateEndpoint', function () {
                    var endpoint = {
                        activate: function () {}
                    };
                    
                    spyOn(endpoint, 'activate');
                    
                    ParlayEndpointManager.activateEndpoint(endpoint);
                    
                    expect(endpoint.activate).toHaveBeenCalled();
                    
                });
                
            });
                        
        });
        
    	describe('ParlayEndpointController', function () {
    		var scope, ParlayEndpointController, ParlayEndpointManager;
    
    		beforeEach(inject(function($rootScope, $controller) {
        		ParlayEndpointManager = {
        			getActiveEndpoints: function () {
            			return [];
        			},
        			requestDiscovery: function () {}
    			};
    			scope = $rootScope.$new();
    			ParlayEndpointController = $controller('ParlayEndpointController', {$scope: scope, ParlayEndpointManager: ParlayEndpointManager});
    		}));
    		
    		describe('endpoint filtering', function () {
        		it('calls ParlayEndpointManager', function () {
                    expect(scope.filterEndpoints()).toEqual([]);
        		});
    		});
    		
    		describe('discovery request', function () {
        		it('calls ParlayEndpointManager', function () {
            		spyOn(ParlayEndpointManager, 'requestDiscovery');
            		scope.requestDiscovery();
            		expect(ParlayEndpointManager.requestDiscovery).toHaveBeenCalled();
        		});
    		});    		
        
    	});
    	
    	describe('endpointSearch', function () {
        	var scope, ParlayEndpointSearchController, ParlayEndpointManager;
        	
        	beforeEach(inject(function ($rootScope, $controller) {
            	ParlayEndpointManager = {
                	activateEndpoint: function(endpoint) {},
                	getAvailableEndpoints: function(query) {
                    	return [
                        	{
                            	matchesQuery: function () {
                                	return true;
                            	}
                        	},
                        	{
                            	matchesQuery: function () {
                                	return true;
                            	}
                        	},
                        	{
                            	matchesQuery: function () {
                                	return false;
                            	}
                        	}
                    	];
                	}
            	};
            	scope = $rootScope.$new();
            	ParlayEndpointSearchController = $controller('ParlayEndpointSearchController', {$scope: scope, ParlayEndpointManager: ParlayEndpointManager});
        	}));
        	
        	describe('search state', function () {
    
    			it('initilization', function () {
    				expect(scope.isSearching).toBeFalsy();
    			});
    
    			it('toggle', function () {
    				expect(scope.searching).toBeFalsy();
    				scope.toggleSearch();
    				expect(scope.searching).toBeTruthy();
    				scope.toggleSearch();
    				expect(scope.searching).toBeFalsy();
    			});
    			
    			it('selects endpoint', function () {
        			
        			spyOn(ParlayEndpointManager, 'activateEndpoint');
        			
        			var endpoint = {
            			name: 'test'
        			};
        			
        			scope.search_text = 'still here';
        			
        			scope.selectEndpoint(endpoint);
        			
        			expect(scope.selected_item).toBe(null);
        			expect(scope.search_text).toBe(null);
        			expect(ParlayEndpointManager.activateEndpoint).toHaveBeenCalledWith(endpoint);
        			
    			});
    			
    			it('handles undefined endpoint selection', function () {
        			spyOn(ParlayEndpointManager, 'activateEndpoint');
        			
        			scope.search_text = 'still here';
        			
        			var endpoint = null;
        			
        			scope.selectEndpoint(endpoint);        			

        			expect(scope.search_text).toBe('still here');
    			});
    
    		});
    		
    		describe('searching', function () {
        		  
        		  it('filters correctly', function () {
            		  expect(scope.querySearch('test').length).toBe(2);
        		  });
        		  
        		  it('defaults to no filter if query not provided', function () {
            		  expect(scope.querySearch('').length).toBe(3);
        		  });
        		  
    		});
    		
    	});
    	
    	describe('<parlay-endpoint-card>', function () {
        	var element, mockEndpoint, scope;
        	
        	mockEndpoint = {
            	directives: {
                	toolbar: ['promenadeStandardEndpointCardToolbar'],
                	tabs: ['promenadeStandardEndpointCardLog', 'promenadeStandardEndpointCardCommands']
            	},
            	getDirectives: function () {
                	return [this.directives];
            	}
        	};
        	
        	beforeEach(inject(function($compile, $rootScope) {
            	scope = $rootScope.$new();
            	$rootScope.container = {
	            	ref: mockEndpoint
	            };
            	element = $compile('<parlay-endpoint-card></parlay-endpoint-card')(scope);
                $rootScope.$digest();
        	}));
        	
        	it('inserts toolbar', function () {
            	expect(element.find('promenade-standard-endpoint-card-toolbar').length).toBe(1);
        	});
        	
        	it('inserts tabs', function () {
            	expect(element.find('promenade-standard-endpoint-card-log').length).toBe(1);
            	expect(element.find('promenade-standard-endpoint-card-commands').length).toBe(1);
        	});
        	
    	});
        
    });
}());