(function () {
    'use strict';

    describe('parlay.endpoints.endpoint', function() {
        
        beforeEach(module('parlay.endpoints.endpoint'));
        
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
                        toolbar: {
	                        default: [],
	                        available: []
                        },
                        tabs: {
	                        default: ["parlayWidgetTab"],
	                        available: []
                        },
                        available_cache: {}
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
        
        xdescribe('<parlay-endpoint-card>', function () {
        	var element, scope;
        	
        	beforeEach(inject(function($compile, $rootScope) {
            	scope = $rootScope.$new();
            	scope.container = {
	            	ref: {
		            	name: 'mockEndpoint',
		            	getDefaultDirectives: function () {
				            return {
					            toolbar: ["promenadeStandardEndpointCardToolbar"],
					            tabs: ["parlayWidgetTab", "promenadeStandardEndpointCardCommands"]
				            };
			            },
			            getAvailableDirectives: function () {
				            return {
					            toolbar: [],
					            tabs: ["promenadeStandardEndpointCardCommands", "promenadeStandardEndpointCardLog", "promenadeStandardEndpointCardGraph"]
				            };
			            }
			        }
	            };
            	element = $compile('<parlay-endpoint-card></parlay-endpoint-card')(scope);
                $rootScope.$digest();
        	}));
        	
        	it('inserts toolbar', function () {
            	expect(element.find('promenade-standard-endpoint-card-toolbar').length).toBe(1);
        	});
        	
        	it('inserts tabs', function () {
            	expect(element.find('promenade-standard-endpoint-card-commands').length).toBe(1);
        	});
        	
    	});
        
    });
    
}());