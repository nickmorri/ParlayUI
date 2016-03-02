(function () {
    'use strict';
    
    describe('parlay.protocols.list_controller', function() {
    
        beforeEach(module('parlay.protocols.list_controller'));
        
        describe('ParlayProtocolListController', function () {
            var rootScope, scope, ctrl, MockPromenadeBroker;                
            
            beforeEach(inject(function ($rootScope, $controller, $q) {
                
                MockPromenadeBroker = {
                    connected: false,
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
                
                rootScope = $rootScope;
                scope = $rootScope.$new();
                ctrl = $controller('ParlayProtocolListController', {$scope: scope, PromenadeBroker: MockPromenadeBroker});
            }));
            
            describe('PromenadeBroker interactions', function () {
                
                it('tests connection', function () {
                    expect(ctrl.isBrokerConnected()).toBeFalsy();
                    expect(ctrl.getBrokerAddress()).toBe('ws://localhost:8080');
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
                
            });
            
        });
        
    });
    
}());