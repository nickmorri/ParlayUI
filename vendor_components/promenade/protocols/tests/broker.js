(function () {
    "use strict";
    
    describe('promenade.broker', function() {
        
        beforeEach(module('promenade.broker'));
        
        beforeEach(function () {
            
            var mockParlaySocket = {
                connected: false,
                open: function () {
                    this.connected = true;
                },
                close: function () {
                    this.connected = false;
                },
                isConnected: function () {
                    return this.connected;
                },
                sendMessage: function () {
                    //
                },
                onOpen: function () {},
                onClose: function () {},
                getAddress: function () {
                    return 'ws://localhost:8080';
                }
            };
            
            module(function ($provide) {
                $provide.value('ParlaySocket', mockParlaySocket);
            });
        });
        
        describe('PromenadeBroker', function () {
            var PromenadeBroker;
            
            beforeEach(inject(function(_PromenadeBroker_) {
                PromenadeBroker = _PromenadeBroker_;
            }));
            
            describe('initialization', function () {
                
                it('is not connected', function () {
                    expect(PromenadeBroker.isConnected()).toBeFalsy(); 
                });
                
            });
            
            describe('accessors', function () {
                
                it('gets broker address from ParlaySocket', function () {
                    expect(PromenadeBroker.getBrokerAddress()).toBe('ws://localhost:8080');
                });
                
            });
            
            describe('connection', function () {
                
                it('connects', function () {
                    expect(PromenadeBroker.isConnected()).toBeFalsy();
                    PromenadeBroker.connect();
                    expect(PromenadeBroker.isConnected()).toBeTruthy();
                });
                
                it('disconnects', function () {
                    expect(PromenadeBroker.isConnected()).toBeFalsy();
                    PromenadeBroker.connect();
                    expect(PromenadeBroker.isConnected()).toBeTruthy();
                    PromenadeBroker.disconnect();
                    expect(PromenadeBroker.isConnected()).toBeFalsy();
                });
                
            });                
        });

    });
    
    
}());