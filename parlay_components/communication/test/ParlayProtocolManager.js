(function () {
    'use strict';
    
    describe('parlay.protocols.manager', function() {
    
		beforeEach(module('parlay.protocols.manager'));
        beforeEach(module('mock.promenade.broker'));
        beforeEach(module('mock.parlay.socket'));
        
        describe('ProtocolManager', function () {
            var ProtocolManager, PromenadeBroker, $rootScope;
            
            beforeEach(inject(function(_ProtocolManager_, _PromenadeBroker_, _$rootScope_) {
                $rootScope = _$rootScope_;
                ProtocolManager = _ProtocolManager_;
                PromenadeBroker = _PromenadeBroker_;
            }));
                        
            describe('PromenadeBroker interactions', function () {
                
                it('requests discovery', function () {
                    ProtocolManager.requestDiscovery();
                });
                
                it('opens protocol', function () {
                    ProtocolManager.openProtocol({}).then(function (response) {
                        expect(response).toBeTruthy();
                    });
                    $rootScope.$apply();
                });
                
                xit('closes protocol successfully', function () {
                    PromenadeBroker.triggerOnOpen();
                    
                    expect(ProtocolManager.getOpenProtocols().length).toBe(1);
                    
                    ProtocolManager.closeProtocol({
                        NAME: 'TestProtocol'
                    }).then(function (response) {
                        expect(response.STATUS).toBe('ok');
                    });
                    
                    $rootScope.$apply();
                    
                    expect(ProtocolManager.getOpenProtocols().length).toBe(0);                    
                });
                
                it('fails to close protocol', function () {
                    PromenadeBroker.triggerOnOpen();
                    
                    expect(ProtocolManager.getOpenProtocols().length).toBe(1);
                                        
                    ProtocolManager.closeProtocol({
                        getName: function () {
                            return 'failure';
                        }
                    }).catch(function (response) {
                        expect(response.STATUS).not.toBe('ok');
                    });
                    
                    $rootScope.$apply();
                    
                    expect(ProtocolManager.getOpenProtocols().length).toBe(1);
                });
                
            });
            
            describe('events', function () {
                
                it('onClose', function () {
                    expect(ProtocolManager.getAvailableProtocols().length).toBe(1);
                    ProtocolManager.requestDiscovery();
                    expect(ProtocolManager.getOpenProtocols().length).toBe(1);
                    
                    PromenadeBroker.triggerOnClose();
                    
                    expect(ProtocolManager.getAvailableProtocols().length).toBe(0);
                    expect(ProtocolManager.getOpenProtocols().length).toBe(0);
                });
                
                it('onOpen', function () {
                    spyOn(PromenadeBroker, 'requestAvailableProtocols');
                    spyOn(PromenadeBroker, 'requestOpenProtocols');
                    
                    PromenadeBroker.triggerOnOpen();
                    
                    expect(PromenadeBroker.requestAvailableProtocols).toHaveBeenCalled();
                    expect(PromenadeBroker.requestOpenProtocols).toHaveBeenCalled();
                });
                
            });
            
        });
        
    });
    
}());