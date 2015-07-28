(function () {
    'use strict';

    angular.module('mock.promenade.broker', [])
        .factory('PromenadeBroker', ['$q', function($q) {
            var Public = {
                    connected: false
            };
            
            var Private = {
                onOpen: []
            };
            
            Public.onOpen = function (callback) {
                callback();
            };
            
            Public.onClose = function (callback) {
                callback();
            };
            
            Public.onMessage = function () {
                
            };
            
            Public.onOpenSize = function () {
                return Private.onOpen.length;
            };
            
            Public.requestAvailableProtocols = function () {
                return [];
            };
            
            Public.requestOpenProtocols = function () {
                return [];
            };
            
            Public.sendSubscribe = function () {
                return $q(function (resolve, reject) {
                    resolve(true);
                });
            };
            
            Public.sendUnsubscribe = function () {
                return $q(function (resolve, reject) {
                    resolve(true);
                });
            };
            
            return Public;
        }]);
        
    angular.module('mock.parlay.protocols', []).factory('ProtocolManager', ['$q', function ($q) {
        var Public = {
            open: [{}]
        };
                    
        Public.getOpenProtocols = function () {
            return Public.open;
        };
        
        Public.openProtocol = function () {
            return $q(function (resolve, reject) {
                resolve(Public.push({}));
            });
        };
        
        Public.closeProtocol = function () {
            return $q(function (resolve, reject) {
                resolve(Public.open.pop());
            });
        };
        
        return Public;
    }]);
    
    angular.module('mock.parlay.socket', []).factory('ParlaySocket', [function () {
        var Public = {};
        
        Public.onMessage = function () {
            return function () {};
        };
        
        Public.sendMessage = function (topics, contents, response_topics, response_callback) {
            if (contents === null) {
                response_callback({status: -1});
            }
            else {
                contents.status = 0;
                response_callback(contents);
            }
        };
        
        return Public;
    }]);
    
    describe('parlay.protocols', function() {
    
        beforeEach(module('parlay.protocols'));
        beforeEach(module('mock.promenade.broker'));
        beforeEach(module('mock.parlay.socket'));
        
        describe('ParlayProtocol', function () {
            var rootScope, protocol;
            
            beforeEach(inject(function($rootScope, _ParlayProtocol_) {
                /*jshint newcap: false */
                rootScope = $rootScope;
                protocol = new _ParlayProtocol_({name: 'TestProtocol', protocol_type: 'TestProtocolType'});
            }));
            
            it('constructs', inject(function(_ParlayProtocol_) {
                expect(protocol.getName()).toBe('TestProtocol');
                expect(protocol.getType()).toBe('TestProtocolType');
            }));
            
            it('accesses attributes', function () {
                expect(protocol.getAvailableEndpoints()).toEqual([]);
                expect(protocol.getActiveEndpoints()).toEqual([]);
                expect(protocol.getLog()).toEqual([]);
            });
            
            it('records message', function () {
                expect(protocol.getLog()).toEqual([]);
                protocol.recordLog({type: 'test'});
                expect(protocol.getLog()).toEqual([{type: 'test'}]);
            });
            
            it('invokes onMessage callback', function () {
                var testMsg = 'hey';
                protocol.onMessage(function (testResp) {
                    expect(testResp).toEqual(testMsg);
                });
                protocol.invokeCallbacks(testMsg);
            });
            
            describe('performs operations onClose', function () {
                
                it('does not have subscription', function () {
                    protocol.onClose();
                    expect(protocol.getAvailableEndpoints()).toEqual([]);
                    expect(protocol.getActiveEndpoints()).toEqual([]);
                });
                
                it('has subscription', function () {
                    protocol.buildSubscriptionTopics = function () {
                        return {
                            topics: {}
                        };
                    };
                    protocol.subscribe();
                    rootScope.$apply();
                    expect(protocol.hasSubscription()).toBeTruthy();
                    protocol.onClose();
                    expect(protocol.hasSubscription()).toBeFalsy();
                    expect(protocol.getAvailableEndpoints()).toEqual([]);
                    expect(protocol.getActiveEndpoints()).toEqual([]);
                });
                
            });
            
            describe('subscription', function () {
                
                beforeEach(function () {
                    protocol.buildSubscriptionTopics = function () {
                        return {
                            topics: {}
                        };
                    };
                });
                
                it('checks subscription', function () {
                    expect(protocol.hasSubscription()).toBeFalsy();
                });
                
                it('subscribes', function () {                    
                    expect(protocol.hasSubscription()).toBeFalsy();
                    protocol.subscribe();
                    rootScope.$apply();
                    expect(protocol.hasSubscription()).toBeTruthy();
                });
                
                it('unsubscribes', function () {
                    protocol.subscribe();
                    rootScope.$apply();
                    expect(protocol.hasSubscription()).toBeTruthy();
                    protocol.unsubscribe();
                    rootScope.$apply();
                    expect(protocol.hasSubscription()).toBeFalsy();
                });
                
            });
            
            describe('sends a message', function () {
                
                it('resolves', function (done) {
                    protocol.sendMessage({type: 'test'}, {data:[]}, {type: 'test'}).then(function (response) {
                        expect(response).toEqual({status: 0, data:[]});
                        done();
                    });
                    rootScope.$apply();                    
                });
                
                it('rejects', function(done) {
                    protocol.sendMessage({type: 'test'}, null, {type: 'test'}).catch(function (response) {
                        expect(response).toEqual({status: -1});
                        done();
                    });
                    rootScope.$apply();
                });
            });
            
            describe('adding discovery information', function () {
                
                var sample_endpoints = function () {
                    var endpoints = [];
                    
                    for (var i = 0; i < 50; i++) {
                        endpoints.push({
                            ID: 100 + i,
                            INTERFACES: [],
                            NAME: 'TEST' + i,
                            TEMPLATE: 'STD_ENDPOINT'
                        });
                    }
                    
                    return endpoints;
                }();
                
                var sample_discovery = {
                    CHILDREN: sample_endpoints,
                    NAME: 'TEST_PROTOCOL',
                    TEMPLATE: 'Protocol'
                };
                
                it('adds endpoints', function () {
                    expect(protocol.getAvailableEndpoints().length).toBe(0);
                    protocol.addEndpoints(sample_discovery.CHILDREN);
                    expect(protocol.getAvailableEndpoints().length).toBe(50);
                });
                
                it('gets field keys', function () {
                    expect(protocol.getDynamicFieldKeys().length).toBe(0);
                });
                
                it('buildsFields', function () {
                    expect(protocol.getDynamicFieldKeys().length).toBe(0);
                    protocol.buildFields(sample_discovery);
                    expect(protocol.getDynamicFieldKeys().length).toBe(3);
                });
                
                it('does full discovery process', function () {
                    expect(protocol.getAvailableEndpoints().length).toBe(0);
                    expect(protocol.getDynamicFieldKeys().length).toBe(0);
                    protocol.addDiscoveryInfo(sample_discovery);
                    expect(protocol.NAME).toBe(sample_discovery.NAME);
                    expect(protocol.getAvailableEndpoints().length).toBe(50);
                    expect(protocol.getDynamicFieldKeys().length).toBe(3);
                });
                
                it('endpoint activation', function () {
                    protocol.addDiscoveryInfo(sample_discovery);
                    expect(protocol.getActiveEndpoints().length).toBe(0);
                    var num_available_endpoints = protocol.getAvailableEndpoints().length;
                    
                    var test_endpoint = protocol.getAvailableEndpoints()[1];
                    
                    protocol.activateEndpoint(test_endpoint);
                    expect(protocol.getActiveEndpoints().length).toBe(1);
                    expect(protocol.getActiveEndpoints()[0]).toEqual(test_endpoint);
                    expect(protocol.getAvailableEndpoints().length).toBe(num_available_endpoints - 1);
                });
                
                it('endpoint activation attempt', function () {
                    protocol.addDiscoveryInfo(sample_discovery);
                    expect(protocol.getActiveEndpoints().length).toBe(0);
                    var num_available_endpoints = protocol.getAvailableEndpoints().length;
                    
                    var test_endpoint = sample_discovery.CHILDREN[1];
                    
                    expect(function () {
                        protocol.activateEndpoint(test_endpoint);
                    }).toThrow();
                    
                    expect(protocol.getActiveEndpoints().length).toBe(0);
                    expect(protocol.getActiveEndpoints()[0]).not.toEqual(test_endpoint);
                    expect(protocol.getAvailableEndpoints().length).toBe(num_available_endpoints);
                });
                
            });
            
            describe('methods to be described by prototypical inheritors', function () {
                
                it('raises NotImplementedError on onOpen', function () {
                    spyOn(console, 'warn');
            		protocol.onOpen();
                    expect(console.warn).toHaveBeenCalledWith('onOpen is not implemented for TestProtocol');
                });
                
                it('raises NotImplementedError on buildSubscriptionTopics', function () {
                    spyOn(console, 'warn');
            		protocol.buildSubscriptionTopics();
                    expect(console.warn).toHaveBeenCalledWith('buildSubscriptionTopics is not implemented for TestProtocol');
                });
                
            });

        });
        
        describe('ProtocolManager', function () {
            var ProtocolManager;
            
            beforeEach(inject(function(_ProtocolManager_) {
                ProtocolManager = _ProtocolManager_;
            }));
            
            xdescribe('initialization', function () {
                spyOn(ProtocolManager._private, 'clearProtocols');
                
                it('registers a onClose with PromenadeBroker', function () {
                    expect(ProtocolManager._private.clearProtocols).toHaveBeenCalled();
                });
                
            });
            
        });
        
        describe('Protocol Controllers', function () {
            
            beforeEach(module('mock.parlay.protocols'));
        
            describe('ProtocolConfigurationController', function () {
                
            });
            
        });
        
    });
    
}());