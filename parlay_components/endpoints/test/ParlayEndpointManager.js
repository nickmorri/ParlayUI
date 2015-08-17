(function () {
    'use strict';

    describe('parlay.endpoints.manager', function() {
        
        beforeEach(module('parlay.endpoints.manager'));
        
        describe('ParlayEndpointManager', function () {
            var scope, ParlayEndpointManager, PromenadeBroker;
            
            beforeEach(function () {
                function PromenadeBroker() {
                    return {
                        requestDiscovery: function () {},
                        onDiscovery: function (callback) {
	                        callback();
                        }
                    };                    
                }
                
                function ProtocolManager() {
                    return {
                        getOpenProtocols: function () {
                            return [
                                {
                                    getActiveEndpoints: function () {
                                        return [1];
                                    },
                                    getAvailableEndpoints: function () {
                                        return [3];
                                    }
                                },
                                {
                                    getActiveEndpoints: function () {
                                        return [2];
                                    },
                                    getAvailableEndpoints: function () {
                                        return [4];
                                    }
                                }
                            ];
                        }
                    };
                }
                
                module(function ($provide) {
                    $provide.service('PromenadeBroker', PromenadeBroker);
                    $provide.service('ProtocolManager', ProtocolManager);
                });
                
            });
            
            beforeEach(inject(function (_ParlayEndpointManager_, _PromenadeBroker_) {
                PromenadeBroker = _PromenadeBroker_;
                ParlayEndpointManager = _ParlayEndpointManager_;
            }));
            
            describe('accessors', function () {
                
                xit('getActiveEndpoints', function () {
                    expect(ParlayEndpointManager.getActiveEndpoints()).toEqual([1,2]);
                });
            
                it('getAvailableEndpoints', function () {
                    expect(ParlayEndpointManager.getAvailableEndpoints()).toEqual([3,4]);
                });
                    
            });
            
            describe('PromenadeBroker interactions', function () {

                it('requestDiscovery', function () {
                    spyOn(PromenadeBroker, 'requestDiscovery');
                    ParlayEndpointManager.requestDiscovery();
                    expect(PromenadeBroker.requestDiscovery).toHaveBeenCalledWith(true);
                });
                
            });
            
            describe('ProtocolManager interactions', function () {
                
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