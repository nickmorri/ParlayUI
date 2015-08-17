(function () {
    'use strict';
    
    describe('promenade.broker', function() {        
        
        beforeEach(module('promenade.broker'));        
        beforeEach(module('mock.parlay.socket'));
        
        describe('PromenadeBroker', function () {
            var PromenadeBroker, ParlaySocket;
            
            beforeEach(inject(function(_PromenadeBroker_, _ParlaySocket_) {
                PromenadeBroker = _PromenadeBroker_;
                ParlaySocket = _ParlaySocket_;
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
                
                it('does on open logic', function () {});
                
                it('does on close logic', function () {});
                
            });
            
            describe('requests over socket', function () {
                
                it('available protocols', function () {
                    spyOn(ParlaySocket, 'sendMessage');
                    
                    PromenadeBroker.requestAvailableProtocols();
                    
                    expect(ParlaySocket.sendMessage).toHaveBeenCalled();
                });
                
                it('open protocols', function () {
                    spyOn(ParlaySocket, 'sendMessage');
                    
                    PromenadeBroker.requestOpenProtocols();
                    
                    expect(ParlaySocket.sendMessage).toHaveBeenCalled();
                });
                
                it('open protocol', function () {
                    spyOn(ParlaySocket, 'sendMessage');
                    
                    PromenadeBroker.openProtocol({});
                    
                    expect(ParlaySocket.sendMessage).toHaveBeenCalled();
                });
                
                it('close protocol', function () {
                    spyOn(ParlaySocket, 'sendMessage');
                    
                    PromenadeBroker.closeProtocol({});
                    
                    expect(ParlaySocket.sendMessage).toHaveBeenCalled();
                });
                
                it('discovers', function () {
                    spyOn(ParlaySocket, 'sendMessage');
                    
                    PromenadeBroker.requestDiscovery(true);
                    
                    expect(ParlaySocket.sendMessage).toHaveBeenCalled();
                });
                
                it('sends request', function () {});
                
                it('subscribes', function () {});
                
                it('unsubscribes', function () {});
                
            });
            
        });

    });
    
    
}());