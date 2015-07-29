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
    		
    		describe('prototype methods', function () {
        		
        		it('accessors', function () {
            		expect(ParlayEndpoint.getType()).toBe('ParlayEndpoint');
            		expect(ParlayEndpoint.getDirectives()).toEqual([{
                        toolbar: [],
                        tabs: []
                    }]);
        		});
        		
        		it('endpoint activation', function () {
            		// Do something with spy
            		spyOn(protocol, 'activateEndpoint');
            		ParlayEndpoint.activate();
            		expect(protocol.activateEndpoint).toHaveBeenCalledWith(ParlayEndpoint);
        		});
        		
        		it('throws NotImplementedError', function () {
            		spyOn(console, 'warn');
            		ParlayEndpoint.matchesQuery('test');
                    expect(console.warn).toHaveBeenCalledWith('matchesQuery is not implemented for context');
        		});
        		
    		});
    		
        });
        
        describe('EndpointManager', function () {
            var scope, EndpointManager, PromenadeBroker;
            
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
            
            beforeEach(inject(function (_EndpointManager_, _PromenadeBroker_) {
                PromenadeBroker = _PromenadeBroker_;
                EndpointManager = _EndpointManager_;
            }));
            
            describe('accessors', function () {
                
                it('getActiveEndpoints', function () {
                    expect(EndpointManager.getActiveEndpoints()).toEqual([1,2]);
                });
            
                it('getAvailableEndpoints', function () {
                    expect(EndpointManager.getAvailableEndpoints()).toEqual([3,4]);
                });
                    
            });
            
            describe('PromenadeBroker interactions', function () {

                it('requestDiscovery', function () {
                    spyOn(PromenadeBroker, 'requestDiscovery');
                    EndpointManager.requestDiscovery();
                    expect(PromenadeBroker.requestDiscovery).toHaveBeenCalledWith(true);
                });
                
            });
            
            describe('ProtocolManager interactions', function () {
                
                it('activateEndpoint', function () {
                    var endpoint = {
                        activate: function () {}
                    };
                    
                    spyOn(endpoint, 'activate');
                    
                    EndpointManager.activateEndpoint(endpoint);
                    
                    expect(endpoint.activate).toHaveBeenCalled();
                    
                });
                
            });
                        
        });
        
    	describe('endpointController', function () {
    		var scope, EndpointController, EndpointManager;
    
    		beforeEach(inject(function($rootScope, $controller) {
        		EndpointManager = {
        			getActiveEndpoints: function () {
            			return [];
        			},
        			requestDiscovery: function () {}
    			};
    			scope = $rootScope.$new();
    			EndpointController = $controller('EndpointController', {$scope: scope, EndpointManager: EndpointManager});
    		}));
    		
    		describe('endpoint filtering', function () {
        		it('calls EndpointManager', function () {
                    expect(scope.filterEndpoints()).toEqual([]);
        		});
    		});
    		
    		describe('discovery request', function () {
        		it('calls EndpointManager', function () {
            		spyOn(EndpointManager, 'requestDiscovery');
            		scope.requestDiscovery();
            		expect(EndpointManager.requestDiscovery).toHaveBeenCalled();
        		});
    		});    		
        
    	});
    	
    	describe('endpointSearch', function () {
        	var scope, endpointSearchController, EndpointManager;
        	
        	beforeEach(inject(function ($rootScope, $controller) {
            	EndpointManager = {
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
            	endpointSearchController = $controller('ParlayEndpointSearchController', {$scope: scope, EndpointManager: EndpointManager});
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
        			
        			spyOn(EndpointManager, 'activateEndpoint');
        			
        			var endpoint = {
            			name: 'test'
        			};
        			
        			scope.search_text = 'still here';
        			
        			scope.selectEndpoint(endpoint);
        			
        			expect(scope.selected_item).toBe(null);
        			expect(scope.search_text).toBe(null);
        			expect(EndpointManager.activateEndpoint).toHaveBeenCalledWith(endpoint);
        			
    			});
    			
    			it('handles undefined endpoint selection', function () {
        			spyOn(EndpointManager, 'activateEndpoint');
        			
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
            	$rootScope.endpoint = mockEndpoint;
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