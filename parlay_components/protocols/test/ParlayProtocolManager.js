(function () {
    'use strict';
    
    describe('parlay.protocols.manager', function() {
    
		beforeEach(module('parlay.protocols.manager'));
        beforeEach(module('mock.promenade.broker'));
        beforeEach(module('mock.parlay.socket'));
        
        describe('ParlayProtocolManager', function () {
            var ParlayProtocolManager, PromenadeBroker, $rootScope;
            
            beforeEach(inject(function(_ParlayProtocolManager_, _PromenadeBroker_, _$rootScope_) {
                $rootScope = _$rootScope_;
                ParlayProtocolManager = _ParlayProtocolManager_;
                PromenadeBroker = _PromenadeBroker_;
            }));
                        
            describe('PromenadeBroker interactions', function () {

                it('opens protocol', function () {
                    ParlayProtocolManager.openProtocol({}).then(function (response) {
                        expect(response).toBeTruthy();
                    });
                    $rootScope.$apply();
                });
                
                xit('closes protocol successfully', function () {
                    PromenadeBroker.triggerOnOpen();
                    
                    expect(ParlayProtocolManager.getOpenProtocols().length).toBe(1);
                    
                    ParlayProtocolManager.closeProtocol({
                        NAME: 'TestProtocol'
                    }).then(function (response) {
                        expect(response.STATUS).toBe('ok');
                    });
                    
                    $rootScope.$apply();
                    
                    expect(ParlayProtocolManager.getOpenProtocols().length).toBe(0);                    
                });
                
                it('fails to close protocol', function () {
                    PromenadeBroker.triggerOnOpen();
                    
                    expect(ParlayProtocolManager.getOpenProtocols().length).toBe(1);
                                        
                    ParlayProtocolManager.closeProtocol({
                        getName: function () {
                            return 'failure';
                        }
                    }).catch(function (response) {
                        expect(response.STATUS).not.toBe('ok');
                    });
                    
                    $rootScope.$apply();
                    
                    expect(ParlayProtocolManager.getOpenProtocols().length).toBe(1);
                });
                
            });
            
            describe('events', function () {
                
                it('onClose', function () {
                    expect(ParlayProtocolManager.getAvailableProtocols().length).toBe(1);
                    PromenadeBroker.requestDiscovery();
                    expect(ParlayProtocolManager.getOpenProtocols().length).toBe(1);
                    
                    PromenadeBroker.triggerOnClose();
                    
                    expect(ParlayProtocolManager.getAvailableProtocols().length).toBe(0);
                    expect(ParlayProtocolManager.getOpenProtocols().length).toBe(0);
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