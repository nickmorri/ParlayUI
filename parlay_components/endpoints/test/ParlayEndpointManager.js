(function () {
    'use strict';

    describe('parlay.endpoints.manager', function() {
        
        beforeEach(module('parlay.endpoints.manager'));
        beforeEach(module('mock.promenade.broker'));
        beforeEach(module('mock.parlay.protocols.manager'));
        
        describe('ParlayEndpointManager', function () {
            var scope, ParlayEndpointManager, PromenadeBroker;
            
            beforeEach(inject(function (_ParlayEndpointManager_, _PromenadeBroker_) {
                PromenadeBroker = _PromenadeBroker_;
                ParlayEndpointManager = _ParlayEndpointManager_;
            }));
            
            describe('accessors', function () {
                
                it('getActiveEndpoints', function () {
                    expect(ParlayEndpointManager.getActiveEndpoints()).toEqual({});
                });
            
                it('getAvailableEndpoints', function () {
                    expect(ParlayEndpointManager.getAvailableEndpoints().length).toBe(2);
                });
                    
            });
            
            describe('PromenadeBroker interactions', function () {

                it('requestDiscovery', function () {
                    spyOn(PromenadeBroker, 'requestDiscovery');
                    ParlayEndpointManager.requestDiscovery();
                    expect(PromenadeBroker.requestDiscovery).toHaveBeenCalledWith(true);
                });
                
            });
            
            describe('ParlayProtocolManager interactions', function () {
                
               xit('activateEndpoint', function () {
                    var endpoint = {
                        activate: function () {}
                    };
                    
                    spyOn(endpoint, 'activate');
                    
                    ParlayEndpointManager.activateEndpoint(endpoint);
                    
                    expect(endpoint.activate).toHaveBeenCalled();
                    
                });
                
            });
                        
        });
        
    });
    
}());