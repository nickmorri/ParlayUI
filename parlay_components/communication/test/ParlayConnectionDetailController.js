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
            
            PromenadeBroker.openProtocol = function (configuration) {
                return $q(function (resolve, reject) {
                    resolve(true);
                });
            };
            
            PromenadeBroker.closeProtocol = function (protocol) {
                return $q(function (resolve, reject) {
                    if (protocol === 'TestProtocol') resolve({STATUS: 'ok'});
                    else resolve({STATUS: 'error'});
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
                response_callback({STATUS: -1});
            }
            else {
                contents.STATUS = 0;
                response_callback(contents);
            }
        };
        
        return Public;
    }]);
    
    describe('parlay.protocols.detail_controller', function() {
    
    	beforeEach(module('mock.promenade.broker'));
		beforeEach(module('mock.parlay.socket'));    
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