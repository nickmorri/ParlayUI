(function () {
    'use strict';
    
    describe('parlay.protocols.detail_controller', function() {
    
		beforeEach(module('parlay.protocols.detail_controller'));
        
        describe('ProtocolConnectionDetailController', function () {
                var scope, ProtocolConnectionDetailController, mockProtocol;
                
                beforeEach(inject(function ($rootScope, $controller) {
                    mockProtocol = {
                        has_subscription: false,
                        getName: function () {
                            return 'foo';
                        },
                        getLog: function () {
                            return [];
                        },
                        hasListener: function () {
                            return this.has_subscription;
                        },
                        subscribe: function () {
                            this.has_subscription = true;
                        },
                        unsubscribe: function () {
                            this.has_subscription = false;
                        }
                    };
                    scope = $rootScope.$new();
                    ProtocolConnectionDetailController = $controller('ProtocolConnectionDetailController', {$scope: scope, protocol: mockProtocol});
                }));
                
                describe('protocol interactions', function () {
                    
                    it('gets protocols name', function () {
                        expect(scope.getProtocolName()).toBe('foo');
                    });
                    
                    it('gets log', function () {
                        expect(scope.getLog()).toEqual([]);
                    });
                    
                });
                
            });
        
    });
    
}());