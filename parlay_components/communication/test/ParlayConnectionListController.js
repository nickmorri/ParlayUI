(function () {
    'use strict';
    
    describe('parlay.protocols.list_controller', function() {
    
        beforeEach(module('parlay.protocols.list_controller'));
        
        describe('ParlayConnectionListController', function () {
            var rootScope, scope, ParlayConnectionListController, MockPromenadeBroker;                
            
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
                    }
                };
                
                rootScope = $rootScope;
                scope = $rootScope.$new();
                ParlayConnectionListController = $controller('ParlayConnectionListController', {$scope: scope, PromenadeBroker: MockPromenadeBroker});
            }));
            
            describe('PromenadeBroker interactions', function () {
                
                it('tests connection', function () {
                    expect(scope.isBrokerConnected()).toBeFalsy();
                    expect(scope.getBrokerAddress()).toBe('ws://localhost:8080');
                });
                
                it('toggles connection', function () {
                    expect(scope.isBrokerConnected()).toBeFalsy();
                    scope.toggleBrokerConnection();
                    expect(scope.isBrokerConnected()).toBeTruthy();
                    scope.toggleBrokerConnection();                        
                    expect(scope.isBrokerConnected()).toBeFalsy();
                });
                
            });
            
        });
        
    });
    
}());