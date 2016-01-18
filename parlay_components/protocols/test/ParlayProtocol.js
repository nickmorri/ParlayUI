(function () {
    'use strict';

	var sample_items = function () {
	    var items = [];
	    
	    for (var i = 0; i < 50; i++) {
	        items.push({
	            ID: 100 + i,
	            INTERFACES: [],
	            NAME: 'TEST' + i,
	            TEMPLATE: 'STD_ITEM'
	        });
	    }
	    
	    return items;
	}();
	
	var sample_discovery = {
	    CHILDREN: sample_items,
	    NAME: 'TestProtocol',
	    TEMPLATE: 'Protocol'
	};

    describe('parlay.protocols.protocol', function() {
    
        beforeEach(module('parlay.protocols.protocol'));
        beforeEach(module('mock.parlay.socket'));
        
        describe('ParlayProtocol', function () {
            var rootScope, protocol;
            
            beforeEach(inject(function($rootScope, _ParlayProtocol_) {
                /*jshint newcap: false */
                rootScope = $rootScope;
                protocol = new _ParlayProtocol_({name: 'TestProtocol', protocol_type: 'TestProtocolType'});
            }));
            
            it('constructs', function() {
                expect(protocol.getName()).toBe('TestProtocol');
                expect(protocol.getType()).toBe('TestProtocolType');
            });
            
            it('accesses attributes', function () {
                expect(protocol.getAvailableItems()).toEqual([]);
                expect(protocol.getLog()).toEqual([]);
            });
            
            it('performs operations onClose', function () {
                protocol.listeners.test = function () {};
                protocol.onClose();
                expect(protocol.listeners.test).toBeUndefined();
                
            });
            
            describe('sends a message', function () {
                
                it('resolves', function (done) {
                    protocol.sendMessage({type: 'test'}, {data:[]}, {type: 'test'}).then(function (response) {
                        expect(response).toEqual({STATUS: 0, data:[]});
                        done();
                    });
                    rootScope.$apply();                    
                });

            });
            
            describe('adding discovery information', function () {
                
                it('adds items', function () {
                    expect(protocol.getAvailableItems().length).toBe(0);
                    protocol.addItems(sample_discovery.CHILDREN);
                    expect(protocol.getAvailableItems().length).toBe(50);
                });
                
                it('does full discovery process', function () {
                    expect(protocol.getAvailableItems().length).toBe(0);
                    protocol.addDiscoveryInfo(sample_discovery);
                    expect(protocol.getAvailableItems().length).toBe(50);
                });
                
            });

        });
        
    });
    
}());