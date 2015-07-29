(function () {
    'use strict';

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
        NAME: 'TestProtocol',
        TEMPLATE: 'Protocol'
    };

    angular.module('mock.promenade.broker', [])
        .factory('PromenadeBroker', ['$q', function($q) {
            var PromenadeBroker = {
                connected: false,
                onDiscoveryCallbacks: [],
                onOpenCallbacks: [],
                onCloseCallbacks: []
            };
            
            PromenadeBroker.requestAvailableProtocols = function () {
                return $q(function (resolve, reject) {
                    resolve([]);
                });
            };
            
            PromenadeBroker.requestOpenProtocols = function () {
                return $q(function (resolve, reject) {
                    resolve([]);
                });
            };
            
            PromenadeBroker.sendSubscribe = function () {
                return $q(function (resolve, reject) {
                    resolve(true);
                });
            };
            
            PromenadeBroker.sendUnsubscribe = function () {
                return $q(function (resolve, reject) {
                    resolve(true);
                });
            };
            
            PromenadeBroker.requestDiscovery = function () {
                PromenadeBroker.onDiscoveryCallbacks.forEach(function (callback) {
                    callback({discovery: [sample_discovery]});
                });
            };
            
            PromenadeBroker.onDiscovery = function (callback) {
                PromenadeBroker.onDiscoveryCallbacks.push(callback);
            };
            
            PromenadeBroker.onOpen = function (callback) {
                PromenadeBroker.onOpenCallbacks.push(callback);
            };
            
            PromenadeBroker.onClose = function (callback) {
                PromenadeBroker.onCloseCallbacks.push(callback);
            };
            
            PromenadeBroker.onMessage = function (response_topics, response_callback) {
                if (response_topics.response === 'get_protocols_response') response_callback({
                    TestProtocol: {
                        params: ['port', 'timing'],
                        defaults: {
                            port: 10,
                            timing: 50
                        }
                    }
                });
                else if (response_topics.response === 'get_open_protocols_response') response_callback({protocols: [
                    {
                        name: 'TestProtocol',
                        protocol_type: 'PromenadeDirectMessageProtocol'
                    }
                ]});
                else response_callback(response_topics);
            };
            
            PromenadeBroker.triggerOnClose = function () {
                PromenadeBroker.onCloseCallbacks.forEach(function (callback) {
                    callback();
                });
            };
            
            PromenadeBroker.triggerOnOpen = function () {
                PromenadeBroker.onOpenCallbacks.forEach(function (callback) {
                    callback();
                });
            };
            
            return PromenadeBroker;
        }]);
        
    angular.module('mock.parlay.protocols', []).factory('ProtocolManager', ['$q', function ($q) {
        var PromenadeBroker = {
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
            var ProtocolManager, PromenadeBroker;
            
            beforeEach(inject(function(_ProtocolManager_, _PromenadeBroker_) {
                ProtocolManager = _ProtocolManager_;
                PromenadeBroker = _PromenadeBroker_;
            }));
                        
            describe('PromenadeBroker interactions', function () {
                
                it('requests discovery', function () {
                    ProtocolManager.requestDiscovery();
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
                    spyOn(PromenadeBroker, 'requestAvailableProtocols')
                    spyOn(PromenadeBroker, 'requestOpenProtocols');
                    
                    PromenadeBroker.triggerOnOpen();
                    
                    expect(PromenadeBroker.requestAvailableProtocols).toHaveBeenCalled();
                    expect(PromenadeBroker.requestOpenProtocols).toHaveBeenCalled();
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