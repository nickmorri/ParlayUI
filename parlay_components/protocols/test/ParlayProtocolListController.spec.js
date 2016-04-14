(function () {
    'use strict';
    
    describe('parlay.protocols.list_controller', function() {
    
        beforeEach(module('parlay.protocols.list_controller'));
        
        describe('ParlayProtocolListController', function () {
            var rootScope, scope, ctrl, MockPromenadeBroker, ParlayProtocolManager;
            
            beforeEach(inject(function ($rootScope, $controller, $q, _ParlayProtocolManager_) {
                
                MockPromenadeBroker = {
                    connected: false,
                    version: '0.0.1',
                    isConnected: function () {
                        return this.connected;
                    },
                    getBrokerAddress: function () {
                        return 'ws://localhost:8080';
                    },
                    disconnect: function () {
                        this.connected = false;
                    },
                    connect: function () {
                        this.connected = true;
                    },
                    requestShutdown: function () {
                        this.connected = false;
                    }
                };

                ParlayProtocolManager = _ParlayProtocolManager_;

                ParlayProtocolManager.openProtocol = function () {
                    return $q(function (resolve) { resolve("success"); });
                };

                rootScope = $rootScope;
                scope = $rootScope.$new();
                ctrl = $controller('ParlayProtocolListController', {$scope: scope, PromenadeBroker: MockPromenadeBroker, ParlayProtocolManager: ParlayProtocolManager});
            }));
            
            describe('PromenadeBroker interactions', function () {
                
                it('tests connection', function () {
                    expect(ctrl.isBrokerConnected()).toBeFalsy();
                    expect(ctrl.getBrokerAddress()).toBe('ws://localhost:8080');
                    expect(ctrl.getBrokerVersion()).toBe('0.0.1');
                });

                it("shutdown broker connection", function () {
                    expect(ctrl.isBrokerConnected()).toBeFalsy();
                    ctrl.connectBroker();
                    expect(ctrl.isBrokerConnected()).toBeTruthy();
                    ctrl.shutdownBroker();
                    expect(ctrl.isBrokerConnected()).toBeFalsy();
                });
                
                it('connects to broker', function () {
                    expect(ctrl.isBrokerConnected()).toBeFalsy();
                    ctrl.connectBroker();
                    expect(ctrl.isBrokerConnected()).toBeTruthy();
                });

                it("gets open protocols", function () {
                    expect(ctrl.getOpenProtocols()).toEqual([]);
                });

                it("has open protocols", function () {
                    expect(ctrl.hasOpenProtocols()).toBeFalsy();
                });

                it("gets saved protocols", function () {
                    expect(ctrl.getSavedProtocols()).toEqual([]);
                });

                it("has saved protocols", function () {
                    expect(ctrl.hasSavedProtocols()).toBeFalsy();
                });

                it("opens saved protocol", function () {
                    spyOn(ParlayProtocolManager, "openProtocol").and.callThrough();
                    ctrl.openSavedProtocol({});
                    expect(ParlayProtocolManager.openProtocol).toHaveBeenCalledWith({});
                    expect(ctrl.connecting).toBeTruthy();
                    rootScope.$apply();
                    expect(ctrl.connecting).toBeFalsy();
                });
                
                it("deletes saved protocol", function () {
                    var configuration = {};
                    spyOn(ParlayProtocolManager, "deleteProtocolConfiguration");
                    ctrl.deleteSavedProtocol(configuration);
                    expect(ParlayProtocolManager.deleteProtocolConfiguration).toHaveBeenCalledWith({});
                });

                it("closes protocol", function () {
                    var protocol = {};
                    spyOn(ParlayProtocolManager, "closeProtocol");
                    ctrl.closeProtocol(protocol);
                    expect(ParlayProtocolManager.closeProtocol).toHaveBeenCalledWith(protocol);
                });
                
            });
            
        });
        
    });
    
}());