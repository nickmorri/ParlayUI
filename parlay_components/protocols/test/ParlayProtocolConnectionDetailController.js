(function () {
    'use strict';
    
    describe('parlay.protocols.detail_controller', function() {
    
		beforeEach(module('parlay.protocols.detail_controller'));
		beforeEach(module('mock.parlay.protocols.protocol'));
        
        describe('ParlayProtocolDetailController', function () {
                var scope, ctrl;
                
                beforeEach(inject(function ($rootScope, $controller, ParlayProtocol) {
                    scope = $rootScope.$new();
                    ctrl = $controller('ParlayProtocolDetailController', {$scope: scope, protocol: ParlayProtocol});
                }));
                
                describe('protocol interactions', function () {
                    
                    it('gets protocols name', function () {
                        expect(ctrl.getProtocolName()).toBe('foo');
                    });
                    
                    it('gets log', function () {
                        expect(ctrl.getLog()).toEqual([]);
                    });
                    
                });
                
            });
        
    });
    
}());