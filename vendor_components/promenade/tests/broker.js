(function () {
    "use strict";
    
    describe('promenade.broker', function() {
        
        beforeEach(module('promenade.broker'));
        
        beforeEach(function () {
            function mockParlaySocket () {
                
                var Public = {
                    connected: false
                };
                
                Public.open = function () {
                    Public.connected = true;
                };
                
                Public.close = function () {
                    Public.connected = false;
                };
                
                Public.isConnected = function () {
                    return Public.connected;
                };
                
                Public.sendMessage = function () {
                    //
                };
                
                return Public;
            }
            
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
            
            xdescribe('transaction', function () {
                
                it('requests discovery', function () {
                    
                });
                
                it('requests protocols', function () {
                    
                });
                
                it('opens a protocol', function () {
                    
                });
                
                it('closes a protocol', function () {
                    
                });
                
            });
                
        });

    });
    
    
}());