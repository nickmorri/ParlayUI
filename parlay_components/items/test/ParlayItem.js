(function () {
    'use strict';

    describe('parlay.items.item', function() {
        
        beforeEach(module('parlay.items.item'));
        
        describe('ParlayItem', function () {
            var ParlayItem;
            
            var data = {
        		NAME: 'TestProtocol',
        		INTERFACES: []
    		};
    		
    		var protocol = {
        		activateItem: function (item) {}
    		};

            beforeEach(inject(function(_ParlayItem_) {
                /*jshint newcap: false */
                ParlayItem = new _ParlayItem_(data, protocol);
            }));
            
            describe('construction', function () {
                
                it('has correct default values', function () {
                    expect(ParlayItem.directives).toEqual({
                        toolbar: {
	                        default: [],
	                        available: []
                        },
                        tabs: {
	                        default: [],
	                        available: []
                        },
                        available_cache: {}
                    });
                    expect(ParlayItem.type).toBe('ParlayItem');
                    
                });
                
                it('has correct constructor parameters', function () {
                    expect(ParlayItem.name).toBe(data.NAME);
                    expect(ParlayItem.interfaces).toEqual(data.INTERFACES);
                    expect(ParlayItem.protocol).toEqual(protocol);
                });
                
    		});
    		
        });
        
        xdescribe('<parlay-item-card>', function () {
        	var element, scope;
        	
        	beforeEach(inject(function($compile, $rootScope) {
            	scope = $rootScope.$new();
            	scope.container = {
	            	ref: {
		            	name: 'mockItem',
		            	getDefaultDirectives: function () {
				            return {
					            toolbar: ["promenadeStandardItemCardToolbar"],
					            tabs: ["parlayWidgetTab", "promenadeStandardItemCardCommands"]
				            };
			            },
			            getAvailableDirectives: function () {
				            return {
					            toolbar: [],
					            tabs: ["promenadeStandardItemCardCommands", "promenadeStandardItemCardLog", "promenadeStandardItemCardGraph"]
				            };
			            }
			        }
	            };
            	element = $compile('<parlay-item-card></parlay-item-card')(scope);
                $rootScope.$digest();
        	}));
        	
        	it('inserts toolbar', function () {
            	expect(element.find('promenade-standard-item-card-toolbar').length).toBe(1);
        	});
        	
        	it('inserts tabs', function () {
            	expect(element.find('promenade-standard-item-card-commands').length).toBe(1);
        	});
        	
    	});
        
    });
    
}());